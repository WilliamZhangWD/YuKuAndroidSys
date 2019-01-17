package cn.edu.hznu.yuku;
import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import org.json.JSONArray;
import org.json.JSONObject;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;


public class LoginActivity extends AppCompatActivity {
    Button mLogin;
    Button mRegister;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        //隐藏导航
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }
        login();
        register();
    }
    //登录操作
    private void login(){
        mLogin=(Button)findViewById(R.id.sign_in_button);
        mLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                EditText phoneCount=(EditText)findViewById(R.id.phone_count);
                EditText password=(EditText)findViewById(R.id.password);
                final String phoneVal=phoneCount.getText().toString();
                final String passwordVal=password.getText().toString();
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        int successBack=getLoginCallBack(phoneVal,passwordVal);
                        Log.e("returnData",successBack+"");
                        if(successBack==1){
                            Log.e("returnData","登录成功");
                        }
                        else if(successBack==0){
                            Log.e("returnData","密码或账号错误");
                        }
                        else{
                            Log.e("returnData","格式不对");
                        }
                    }
                }).start();

            }
        });
    }
    //注册
    private void register(){

    }

    //发送请求
    private int getLoginCallBack(String phoneVal,String passwordVal){
        int successBack=-1;
        try{
            OkHttpClient client = new OkHttpClient();
            RequestBody requestBody=new FormBody.Builder()
                    .add("account",phoneVal)
                    .add("password",passwordVal)
                    .build();
            Request request=new Request.Builder()
                    .url(getResources().getString(R.string.localIPv4)+"/api/user/login")
                    //.url("http://172.18.54.21:8082/api/user/login")//必须叫上http
                    .post(requestBody)
                    .build();
            Response response=client.newCall(request).execute();
            String responseData=response.body().string();
            Log.e("returnData",responseData);
            successBack=parseJSONWithJSONObject(responseData);
        }catch (Exception e){
            e.printStackTrace();
        }
        Log.e("发送请求",successBack+"");
        return successBack;
    }
    //解析返回的登录成功信息
    private int parseJSONWithJSONObject(String jsonData){
        int success=-1;
        try{
            Log.e("解析qian",success+"");
            JSONObject jsonObject=new JSONObject(jsonData);
            success=jsonObject.getInt("success");
//            JSONArray jsonArray=new JSONArray(jsonData);
//            Log.e("解析length()",jsonArray.length()+"");
//            for(int i=0;i<jsonArray.length();i++){
//                JSONObject jsonObject=jsonArray.getJSONObject(i);
//                success=jsonObject.getInt("success");
//                Log.e("解析中",success+"");
//            }
        }catch (Exception e){
            e.printStackTrace();
        }
        Log.e("解析",success+"");
        return success;
    }

}

