/**
 * 手机端滚动分页组件，基于jQuery WeUi
 * by mzl 
 * 2016-11-30
 */
(function($){ 
$.fn.srollGrid = function(option){
	   var defaults = {
  		    url:'',//加载数据的url
  		    timestamp:'#intoPageTime',//存储时间戳hidden的id
			data:{},//参数
			loading:false,
			pageSize:10,//每页记录数
			currentPage:1,//当前页
			cache:true,//时候优先从缓存读取数据，如果是false则每次返回列表都刷新数据
			totalPage:10000,//数据总页数，组件自用参数，用户不能自定义值
			success:function(opts){}//数据加载成功，回调函数
	   }
	   var opts = jQuery.extend(defaults,option);
	   $.srollGridFtn.init(opts,$(this));
	   
   };
   
$.srollGridFtn = {
    //初始化方法
	init:function(opts,container){
		  var that = this;
		  //初始化清空缓存数据
		  that.cleanCache(opts,container);
		  
		  //校验标签
		  if(that.valify(opts,container)==false)return false;
		  
		  that.initLoadingTip();
		  
		  var cacheData = that.getCacheData(opts);
		  //判断缓存数据为空，则重新加载数据
		  if(''==cacheData){
			//初始化执行loadata方法
			  that.loadData(opts,container); 
		  }else{
			  //缓存为false，则重新从服务器加载数据
			  if(opts.cache==false){
				  var strs = that.getCurrentPage(opts).split(',');
				  //存储组件调用的pagesize
				  var pageSize = opts.pageSize;
				  var currentPage = strs[0];
				  //把组件的pagesize临时设置为页面跳转之前已经加载的全部数据大小
				  opts.pageSize = (currentPage-1)*opts.pageSize;
				  opts.currentPage = 1;
				  that.loadData(opts,container,true); 
				  
				  var scrollTop = that.getScrollTop(opts);
				  $(window).scrollTop(scrollTop);
				  //把pagesize重置会原来的大小
				  opts.pageSize = pageSize;
				  opts.currentPage = currentPage;
				  opts.totalPage = strs[1];
				  
				 //缓存为true，直接使用缓存的数据
			  }else{
				  container.append(cacheData)
				  var scrollTop = that.getScrollTop(opts);
				  $(window).scrollTop(scrollTop);  
			  }
		  }
		  //定时刷新当前滚动条位置
		  that.setScrollTop(opts);
		  
		  //清空事件
		  $(document.body).unbind();
		  //绑定jQuery WeUi上拉滚动加载页面事件
	      $(document.body).infinite().on("infinite", function() {
	        if(opts.loading) return;
	        opts.loading = true;
	        that.loadData(opts,container)
	      })
	      
	      //绑定页面下拉刷新数据时间
	      $(document.body).pullToRefresh().on("pull-to-refresh", function() {
	    	 setTimeout(function(){
	    		 opts.currentPage = 1;
		    	  opts.totalPage = 10000;
		    	  that.cleanCache(opts,container);
		    	  that.loadData(opts,container)
		    	  $(document.body).pullToRefreshDone();
	    	 },100)
	        });
	      
	},
	//初始化加载提示
	initLoadingTip:function(){
		if($('.weui-infinite-scroll').length==0){
			var loadingTips  = '<div class="weui-infinite-scroll"><div class="infinite-preloader"></div><span>正在加载...</span></div>';
			$(document.body).append(loadingTips);
			
			var reflashTips = '<div class="weui-pull-to-refresh-layer">'
				+'<div class="pull-to-refresh-arrow"></div>'
				+'<div class="pull-to-refresh-preloader"></div>'
				+'<div class="down">下拉刷新</div>'
				+'<div class="up">释放刷新</div>'
				+'<div class="refresh">正在刷新</div>'
				+'</div>';
			$(document.body).prepend(reflashTips);
		}
	},
	/**
	 * 
	 * @param opts
	 * @param container
	 * @param isReflash 是否刷新功能
	 */
	loadData:function(opts,container,isReflash){
		
		var that = this;
		isReflash = null==isReflash||typeof(isReflash)=='undefined'?false:isReflash;
		var paramsData = $.extend(opts.data,{pageSize:opts.pageSize,currentPage:opts.currentPage}); 
		$('.weui-infinite-scroll').find('span').text('正在加载...');
		$('.weui-infinite-scroll').show();
		$('.infinite-preloader').show();
		//当前页数大于总页数，则不再发请求
		if(opts.totalPage<opts.currentPage){
			$('.infinite-preloader').hide();
			$('.weui-infinite-scroll').find('span').text('已无更多数据');
			setTimeout(function(){
				$('.weui-infinite-scroll').hide();
				opts.loading = false;
				var botton = $(window).height()-($('.weui-infinite-scroll').height()+($('.weui-infinite-scroll').offset().top-$(document).scrollTop()));
			},2000);
		}else{
			$.ajax({
				url:opts.url,
				type:'post',
				data:paramsData,
				async:false,
				success:function(data){
					var result = $('<div>'+data+"</div>");
					
					var totalPageDom = result.find('#totalPage');
					if(totalPageDom.length==0){
						alert('请在ajax请求数据页面增加id为“totalPage”的隐藏域存放数据总页数！');
					}else{
						opts.totalPage = totalPageDom.val();
						totalPageDom.remove();
					}
					opts.currentPage = Number(opts.currentPage)+1;
					//不是强行刷新才重置这个totalPage
					if(isReflash==false){
						//数据放入缓存
						that.setCacheData(opts,result.html());
					}
					
					container.append(result.html());
					
					//判断数据不够，则隐藏加载提示
					var bottom = $(window).height()-($('.weui-infinite-scroll').height()+($('.weui-infinite-scroll').offset().top-$(document).scrollTop()));
					if(bottom>0){
						$('.weui-infinite-scroll').hide();
					}
					
					opts.loading = false;
					//选择成功后，执行回调函数
					if($.isFunction(opts.success)){
						opts.success(opts,result.html());
					}
				}
			})
		}
	},
	//清空缓存数据
	cleanCache:function(opts,container){
		this.setCacheData('');
  	    container.html('');
	},
	//校验组件调用时候正确
	valify:function(opts,container){
		if(container.length==0){
			alert('未能找数据渲染容器')
			return false
		}else if($(opts.timestamp).length==0){
			alert('未能找到时间戳隐藏域，请再页面上加入标签<input type="hidden" id="intoPageTime" value="<%=new Date().getTime()%>"/>')
			return false
		}else{
			return true;
		}
	},
	//读取缓存数据
	getCacheData:function(opts){
		var that = this;
		var key = that.getDataKey(opts);
	    var cacheData = that.getStorage(key);
	    cacheData = null==cacheData||typeof(cacheData)=='undefined'?'':cacheData;
	    //初始化当前页
	    that.initCurrentPage(opts);
	    return cacheData;
	},
	setCacheData:function(opts,data){
		var that = this;
		var key = that.getDataKey(opts);
		that.putStorage(key,data,false);
		that.setCurrentPage(opts);
	},
	//获取滚动条高度
	getScrollTop:function(opts){
		var that = this;
		var key = that.getDataKey(opts)+"-scroll";
	    var cacheData = that.getStorage(key);
	    cacheData = null==cacheData||typeof(cacheData)=='undefined'?'0':cacheData;
	    return cacheData;
	},
	//设置滚动条高度
	setScrollTop:function(opts){
		var that = this;
		var key = that.getDataKey(opts)+"-scroll";
		var scrollTop = $(document).scrollTop();
		that.putStorage(key,scrollTop);
		setTimeout(function(){
			that.setScrollTop(opts);
		},500);
	},
	//获取当前页，当前页包括总页数
	getCurrentPage:function(opts){
		var that = this;
		var key = that.getDataKey(opts)+"-currentPage";
	    var cacheData = that.getStorage(key);
	    cacheData = null==cacheData||typeof(cacheData)=='undefined'?'1,1000':cacheData;
	    return cacheData;
	},
	//把缓存中的当前页初始化到参数对象
	initCurrentPage:function(opts){
		var that = this;
		var cacheData = that.getCurrentPage(opts);
	    var strs = cacheData.split(',');
	    opts.currentPage = strs[0];
	    opts.totalPage = strs[1];
	},
	//设置缓存当前页
	setCurrentPage:function(opts){
		var that = this;
		var key = that.getDataKey(opts)+"-currentPage";
	    that.putStorage(key,opts.currentPage+","+opts.totalPage);
	},
	/**
	 * 把数据放入缓存
	 * @param key 缓存的key
	 * @param data  缓存数据
	 * @param isReplace 时候替换数据，如果值为true，则缓存中数据累加
	 */
	putStorage:function(key,data,isReplace){
		var that = this;
		if(isReplace==false){
			var temp = that.getStorage(key);
			data = (null==temp||typeof(temp)=='undefined'?'':temp)+data;
		}
		sessionStorage.setItem(key,data);
	},
	//从缓存加载数据
	getStorage:function(key){
		return sessionStorage.getItem(key);
	},
	//获取数据缓存的key
	getDataKey:function(opts){
		var key = $(opts.timestamp).val();
		return key;
	}
}   
 
})(jQuery);