package cn.edu.hznu.yuku.fragment.mine;

import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;


import cn.edu.hznu.yuku.LoginActivity;
import cn.edu.hznu.yuku.R;

public class MineFragment extends Fragment {
    private View view;
    private TextView wannaLogin;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        view=inflater.inflate(R.layout.fragment_mine,container,false);
        getLogin();
        return view;
    }
    private void getLogin(){
        wannaLogin=(TextView)view.findViewById(R.id.wanna_login);
        wannaLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent=new Intent(getContext(), LoginActivity.class);
                startActivity(intent);
            }
        });
    }

}

