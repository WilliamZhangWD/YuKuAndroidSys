package cn.edu.hznu.yuku;

import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import cn.edu.hznu.yuku.component.BottomBar;
import cn.edu.hznu.yuku.fragment.homePage.HomeFragment;
import cn.edu.hznu.yuku.fragment.mine.MineFragment;
import cn.edu.hznu.yuku.fragment.square.SquareFragment;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //隐藏导航
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }

        //碎片
        BottomBar bottomBar = findViewById(R.id.bottom_bar);
        bottomBar.setContainer(R.id.main_frame_container)
                .setTitleBeforeAndAfterColor("#999999", "#ff5d5e")
                .addItem(HomeFragment.class,
                        "首页",
                        R.drawable.homepage_inactive,
                        R.drawable.homepage_active)
                .addItem(SquareFragment.class,
                        "广场",
                        R.drawable.squarepage_inactive,
                        R.drawable.squarepage_active)
                .addItem(MineFragment.class,
                        "我的",
                        R.drawable.minepage_inactive,
                        R.drawable.minepage_active)
                .build();
    }
}
