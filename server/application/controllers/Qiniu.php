<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \Qiniu\Auth;  
use \Qiniu\Storage\UploadManager;  

class Qiniu extends CI_Controller {
    /** 
     * @desc 获取上传验证 uploadToken 
     * @return mixed 
     */  
    public function getToken(){  
        require 'vendor/Qiniu/php-sdk/autoload.php'; // 以具体文件路径为主  
        
        $bucket = 'wzhi-car'; // 七牛云空间名  
        $accessKey = 'z7x1-PWg6Swytf7LHd4aEBkrvkfg2AFPYCfDfihC'; // 七牛云 accesskey  
        $secretKey = 'kT2ii7yyIvAFcCwuePKcioiwycTZ8QAPM6DZ14xV'; // 七牛云 secretkey  
  
        $auth = new Auth($accessKey,$secretKey);  
        $upToken = $auth->uploadToken($bucket, null , 3600, '');  
        echo json_encode(array('uptoken'=>$upToken));  
    }
}
