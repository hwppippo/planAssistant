<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use QCloud_WeApp_SDK\Mysql\Mysql as DB;

class Repair extends CI_Controller {
    public function index() {
      $open_id=$_GET['open_id'];
      if($open_id==null){
        $this->json([
            'code' => -1,
            'data' => ''
        ]);
      }
      $conditions = 'open_id='.'"'.$open_id.'"';
      //先查询该 openid 的权限
      $rows = DB::select('userAuth', ['cauth'], $conditions);
      if($rows != null){
        $conditions='';
      }

      $suffix = 'order by repair_time desc';
      $operator = '';
      //条件为字符串
      $rows = DB::select('car_repair', ['*'], $conditions, $operator, $suffix);
       $this->json([
          'code' => 0,
          'data' => $rows
        ]);
    }

    public function add() {
    $request = file_get_contents('php://input');
    $request=urldecode($request);
    parse_str($request,$arr);
    if($arr==null)
      return;
    $res = DB::insert('car_repair', [
        'open_id' => $arr['open_id'],
        'carNum' => $arr['carNum'],
        'repair_type' => $arr['repair_type'],
        'repair_time' => $arr['repair_time'],
        'repair_factory'=>$arr['repair_factory'],
        'repair_cost'=>$arr['repair_cost'],
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
