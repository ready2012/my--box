(function(){
	//输入框数字限制输入 目前是限制输入数字
   $( document.body).delegate('.i-limit-input','keydown',function(event){
		var code = event.keyCode;
		return (code>47&&code<58)||(code>95&&code<106)
			||code==8||code==37||code==46||code==39;
	}).delegate('.i-limit-input','paste',function(event){
		return false ;
	}).delegate('.i-limit-input','input',function(event){
		   //chrome   输入法禁止有问题
		   var val = $.trim($(this).val());
		   if(!/^[\d]$/.test(val)){
			   $(this).val(val.replace(/[\D]/g,''));
		   }
   })
})()