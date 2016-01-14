# 简介
获取电视节目预告

# 安装
1. 安装nodejs 0.12.x
2. 解压源程序，进入根目录
3. 执行命令


    $ npm install
    
# 使用
    $ node main channelCode [weekday] 
channelCode 频道代码，可以在channelCode.db文件(可用文本编辑器打开)里看到各频道对应的代码  
weekday 数字,表示一周的第几天，1-7代表本周的周一到周日，8-14代表下周的周一到周日。不填则取当天的weekday  
例如中央1台对应的代码是CCTV-CCTV1,则运行命令`node main CCTV-CCTV1`  
正常情况下返回举例`[{"time": 00:23, "playName": "精彩一刻"},{"time": 05:29, "playName": "人与自然"}]`  
错误情况下返回举例`{"errCode": 1002, "errMsg": "频道不存在"}`


# 作者声明
本程序仅供学习交流使用，对于因此程序产生的各种法律纠纷，作者本人概不承担任何责任  




