<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use QCloud_WeApp_SDK\Mysql\Mysql as DB;

class PlanOrder extends CI_Controller {
    var $access_token = '';
    var $appid='wx690dfbed2a3aba97';
    var $appsecret='0718a86f51fa9ab7b76c950472c89530';

    public function index() {
      $open_id=$_GET['open_id'];
      if($open_id==null){
        $this->json([
            'code' => -1,
            'data' => []
        ]);
      }
      $conditions = 'open_id='.'"'.$open_id.'"';
      //先查询该 openid 的权限
      $cauth = DB::row('userAuth', ['comName','cauth'], $conditions);
      if($cauth == NULL){
        $this->json([
            'code' => -1,
            'data' => []
        ]);
        return;
      }
      // echo $rows->cauth;
      $conditions = $conditions.' and '.'comName='.$cauth->comName;
      //echo $conditions;
      if($cauth->cauth == 1){
        //管理员权限，可以查看该公司所有信息
        $conditions = 'comName='.$cauth->comName;
      }
      //var_dump($conditions);
      $suffix = 'order by startTime desc';
      $operator = '';
      //条件为字符串
      $rows = DB::select('car_planOrder', ['*'], $conditions, $operator, $suffix);
      if($rows==null){
       $this->json([
            'code' => -1,
            'data' => []
        ]);
      }else{
        $this->json([
            'code' => 0,
            'cauth'=>$cauth->cauth,
            'data' => $rows
        ]);
      }
    }

    public function add() {
      $request = file_get_contents('php://input');
      $request=urldecode($request);
      parse_str($request,$arr);
      if($arr==null)
        return;
      //先查询该 id 号属于哪个公司
      $comName=1;
      $conditions = 'open_id='.'"'.$arr['open_id'].'"';
      //先查询该 openid 的权限
      $rows = DB::row('userAuth', ['comName'], $conditions);

      if($rows != null){
        $comName=$rows->comName;
      }else{
        $res = DB::insert('userAuth', [
          'comName'=>$comName,
          'open_id' => $arr['open_id'],
        ]);
      }

    $res = DB::insert('car_planOrder', [
        'prj' => $arr['prj'],
        'carNum' => $arr['carNum'],
        'comName'=>$comName,
        'open_id' => $arr['open_id'],
        'startTime' => $arr['startTime'],
        'endTime' => $arr['endTime'],
        'user'=>$arr['user'],
        'commet'=>$arr['commet'],
        'location'=>$arr['location'],
        'destPlace'=>$arr['destPlace']
      ]);
    if($res){
        $this->json([
            'code' => 0,
            'data' => [
                'msg' => '添加成功'
            ]
        ]);

        //发送审批模板消息,待审批状态
        $this->send_msg($this->encode_approval_pending($arr), 'ozOZn5BVte1lhCndcpAaKPPZnEn4', $arr['form_id']);
      }else{
        $this->json([
            'code' => -1,
            'data' => [
                'msg' => '添加失败'
            ]
        ]);
      }
    }
    
    public function now_time(){
      $year=date("Y");
      $month=date("n");
      $day=date("j");
      $hour=date("H:i");
      $time=$year.'年'.$month.'日'.$day.'日'.' '.$hour;

      return $time;
    }

    public function state() {
      $id=$_GET['id'];
      $state=$_GET['state'];
      $open_id=$_GET['open_id'];
      $form_id=$_GET['form_id'];
      
      $conditions = 'id='.$id;
      //条件为字符串
      $rows = DB::update('car_planOrder', ['isStop' =>$state, 'realEndTime'=>$this->now_time()], $conditions);
       $this->json([
          'code' => 0,
          'data' => $rows
        ]);
      //发送模板消息
      if($state=='完成')
        return;

      //发送审批模板消息,审批完状态
      $this->send_msg($this->encode_approval_complete($id, $state), $open_id, $form_id);

    }
  public function encode_approval_complete($id, $state){
      //先检测 Token
      $this->checkToken();
      $conditions = 'id='.$id;
      //先查询该 openid 的权限
      $rows = DB::row('car_planOrder', ['*'], $conditions);
      if($rows != null){
        $comName=$rows->startTime;
        //拼接模块
        $value = array(
            "keyword1"=>array(
            "value"=>$this->now_time(),
            "color"=>"#4a4a4a"
          ),
            "keyword2"=>array(
            "value"=>$rows->startTime,
            "color"=>"#9b9b9b"
          ),
            "keyword3"=>array(
            "value"=>$rows->carNum,
            "color"=>"#9b9b9b"
          ),
            "keyword4"=>array(
            "value"=>$state,
            "color"=>"#9b9b9b"
          )
        );
      }
      return $value;
    }

    public function encode_approval_pending($arr){
      //先检测 Token
      $this->checkToken();
      //拼接模块
      $value = array(
          "keyword1"=>array(
          "value"=>$this->now_time(),
          "color"=>"#4a4a4a"
        ),
          "keyword2"=>array(
          "value"=>$arr['startTime'],
          "color"=>"#9b9b9b"
        ),
          "keyword3"=>array(
          "value"=>$arr['carNum'],
          "color"=>"#9b9b9b"
        ),
          "keyword4"=>array(
          "value"=>'待审批',
          "color"=>"#9b9b9b"
        )
      );

      return $value;
    }
    
    public function send_msg($value, $openid, $form_id){
      $url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='.$this->access_token;
      $dd = array();
      $dd['touser']= $openid;
      $dd['template_id']='VPa-msQhPF0ldKatdNU2gkEvvwzxdHAo4vcPrOjv-Lg';
      $dd['page']='pages/index/index';  //点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,该字段不填则模板无跳转。
      $dd['form_id']=$form_id;      
      $dd['data']=$value;  
      $dd['color']='';               //模板内容字体的颜色，不填默认黑色
      $dd['emphasis_keyword']='';    //模板需要放大的关键词，不填则默认无放大 
      $result = $this->https_curl_json($url,$dd,'json');
      if($result){
        echo json_encode(array('state'=>5,'msg'=>$result));
      }else{
        echo json_encode(array('state'=>5,'msg'=>$result));
      }
    }

    public function checkToken() {
      $suffix = 'order by update_time desc';
      $access_token_set=DB::row('AccessToken',['*'],'',$suffix);//获取数据
      if($access_token_set){ 
      //检查是否超时，超时了重新获取
      if($access_token_set->AccessExpires >time()){
                          //未超时，直接返回access_token
        echo '未超时';
        $this->access_token = $access_token_set->access_token;
      }else{
        echo '已超时';
        $this->getToken(1);
      }
    }else{
      echo '第一次获取';
      $this->getToken(0);
    }
  }

  public function getToken($flag){
                   //已超时，重新获取
        $url_get='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$this->appid.'&secret='.$this->appsecret;
        $json=json_decode($this->curlGet($url_get));
        $this->access_token=$json->access_token;
        $AccessExpires=time()+intval($json->expires_in);

        $conditions = 'appid='.'"'.$this->appid.'"';

        if($flag == 0){
          $result = DB::insert('AccessToken', ['access_token' =>$this->access_token, 'AccessExpires'=>$AccessExpires, 'appid'=>$this->appid]);
        }else{
          $result = DB::update('AccessToken', ['access_token' =>$this->access_token, 'AccessExpires'=>$AccessExpires, 'update_time'=>$this->now_time()], $conditions);
        }
      }

      public function curlGet($url){
          $ch = curl_init();
          $header = "Accept-Charset: utf-8";
          curl_setopt($ch, CURLOPT_URL, $url);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
          curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
          curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)');
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
          curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $temp = curl_exec($ch);
          return $temp;
	}

   /* 发送json格式的数据，到api接口 -xzz0704  */
    function https_curl_json($url,$data,$type){
        if($type=='json'){//json $_POST=json_decode(file_get_contents('php://input'), TRUE);
            $headers = array("Content-type: application/json;charset=UTF-8","Accept: application/json","Cache-Control: no-cache", "Pragma: no-cache");
            $data=json_encode($data);
        }
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, 1); // 发送一个常规的Post请求
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if (!empty($data)){
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS,$data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers );
        $output = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Errno'.curl_error($curl);//捕抓异常
        }
        curl_close($curl);
        return $output;
    }
}
