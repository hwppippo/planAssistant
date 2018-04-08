<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use QCloud_WeApp_SDK\Mysql\Mysql as DB;

class Repair extends CI_Controller {
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
      $rows = DB::row('userAuth', ['comName','cauth'], $conditions);
      if($rows == NULL){
        $this->json([
            'code' => -1,
            'data' => []
        ]);
        return;
      }
      $conditions = $conditions.' and '.'comName='.$rows->comName;
      //echo $conditions;
      if($rows->cauth == 1){
        //管理员权限，可以查看该公司所有信息
        $conditions = 'comName='.$rows->comName;
      }

      $suffix = 'order by repair_time desc';
      $operator = '';
      //条件为字符串
      $rows = DB::select('car_repair', ['*'], $conditions, $operator, $suffix);
      if($rows==null){
       $this->json([
            'code' => -1,
            'data' => []
        ]);
      }else{
        $this->json([
            'code' => 0,
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

      $res = DB::insert('car_repair', [
          'comName'=>$comName,
          'open_id' => $arr['open_id'],
          'carNum' => $arr['carNum'],
          'repair_type' => $arr['repair_type'],
          'repair_time' => $arr['repair_time'],
          'repair_cost'=>$arr['repair_cost'],
          'invoice'=>$arr['invoice'],
          'deduct'=>$arr['deduct'],
          'repair_location'=>$arr['repair_location'],
          'commet'=>$arr['commet'],
        ]);
      if($res){
          $this->json([
              'code' => 0,
              'data' => [
                  'msg' => '添加成功'
              ]
          ]);
        }else{
          $this->json([
              'code' => -1,
              'data' => [
                  'msg' => '添加失败'
              ]
          ]);
        }
      }

      public function state() {
        $id=$_GET['id'];
        if($id==null){
          $this->json([
              'code' => -1,
              'data' => ''
          ]);
        }
        $conditions = 'id='.$id;
        //条件为字符串
        $rows = DB::update('car_planOrder', ['isStop' =>1, 'realEndTime'=>time()], $conditions);
        $this->json([
            'code' => 0,
            'data' => $rows
          ]);
      }
}
