# scroll-grid

一、组件概述 

基于jQuery WeUi的手机端滚动分页组件，实现上拉加载下一页数据及下拉加载最新数据。对比网上常用手机端分页组件（如，iscroll.js）主要有以下优势： 

1.使用非常简单，学习成本很低，1行js代码既可以完成前端代码编写 

2.列表点击进入详情后，再返回列表时可以保留进入详情前的数据以及滚动的位置。这一点是最重要的优势，也是当时写这个组件的动机。

二、实现思路 

1.基于jQuery WeUi支撑，实现列表上拉、下拉事件的绑定； 

2.采用H5 sessionStorage缓存支持，缓存已加载数据、当前页、总页数； 

3.列表页面有时间戳隐藏域，借助这个隐藏域的时间戳作为sessionStorage的key，解决直接进入列表还是返回进入列表。

三、对组件期望 

1.本人前端代码编写质量不是很高，希望大家可以参与重构代码； 

2.希望大牛参与把下拉、上拉事件监听能够在本插件中实现，成为一个可以独立运行的手机端分页插件，解决移动开发常用难题； 

3.组件可以扩展更多的功能。

四、使用说明

使用本组件引入jQuery WeUi 相关的js和css，同时，引入scroll-grid.js编写下述代码完成组件调用。
 
 $('#list').srollGrid({
 
		 url:'demoList.action'
		 
		 });
		 
代码说明（更多参数请查看源码）：

1."#list"为显示列表的容器

2.url:请求为列表数据url
