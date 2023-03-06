# 极速页导航-无服务版本

访问地址: [jisuye.com](http://jisuye.com)

个人访问地址示例: [jisuye.com/demo](http://jisuye.com/demo)

本项目是基于github Pages服务的导航网站主站

全站开源可以自由fork后修改样式部署自己的服务

# 使用说明

## 快捷键列表

> 快捷键不区分大小写

| 快捷键 | 功能说明 |
| --- | --- |
|`E`|进入编辑模式，可编辑分类、链接数据|
|`V`|退出编辑模式|
|`S`|光标定位到搜索框|
|`G[xx]`|快速打开链接`xx`为分配给链接的快捷键可在编辑时指定|
|`ESC`|取消`S`、`G[xx]`操作|

### 搜索快捷方式
* 输入搜索以@加搜索引擎编号可以切换搜索,如当前使用百度需要用谷歌搜索java，则先按s，输入java@g然后按Enter将使用谷歌搜索
* 临时切换搜索使用`java@gl`在引擎编号后加`l`结尾，则临时使用该引擎
* @d,b,3可以同时打开多个搜索引擎搜索(","分隔)(注意允许弹窗)
* 默认为bing搜索，页面加载时识别google是否可用，如可用则切换到google


## 自定义数据

数据保存在jisuye-data仓库中，想要自定义导航数据可以fork仓库：[jisuye-data](https://github.com/iuv/jisuye-data)

> fork时不要改仓库名

fork完成后就可以访问：http://jisuye.com/xxx

> xxx为用户名

打开个人页面

## 切换代理

访问个人页面时如果长时间加载不到数据，可在底部`github代理`后下拉框中选择使用代理服务

> 代理服务也有失败的可能，可以切换都试试

## 添加、编辑数据

页面数据加载完成后（正常显示链接则代表加载完成）按`E`键进入编辑模式  
可以进行如下操作：
1. 增、删、改链接数据
2. 增、删、改分类数据
3. 调整链接、分类顺序

><span color="red">注意：编辑的数据都在缓存中未保存之前刷新浏览器页面后会丢失，请及时保存！</span>

## 保存数据

编辑完页面链接数据后，可点击底部`复制&提交`链接  
复制当前编辑后的数据并跳转到当前用户对应的`jisuye-data`仓库中`data.json`文件对应的编辑页面  
全选文件内容并按`ctrl/command-v`粘贴复制的链接内容后提交当前文件即可完成保存

> 保存完可以刷新页面确认

## 数据加密

`jisuye-data`为公共仓库，链接数据所有人都可以访问  
为了保护隐私，可以将数据进行加密，访问个人页面后可点击底部`设置密码`链接  
在弹出的输入框中输入密码，点击`确定`按钮后链接数据即完成加密，参考上一节将数据保存到githug仓库后（可以发现数据不再以明文显示），刷新个人页面会发现，此时需要输入密码才可查看数据

> 1. 登录成功会将密码保存到cookie中，实现免登录操作  
> 2. 想要清除密码在设置密码时，不输入内容直接确定即可清除  
> 3. 加解密采用前端AES算法，无服务端操作不记录密码

## 退出登录

数据加密的情况下执行登录成功会默认保存密码到cookie可通过底部`退出登录`链接删除cookie中的密码，并跳转到主页
