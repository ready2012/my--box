$.fn.comboTree = function(options,tree) {
	var options = $.extend({
		url:'tree.json',
		height:200,
		multiple:false,
		selections:[]
	},options);
	var tree = null ;

	var $this = $(this);
	var len = $('.combo-box').length ;
	var addClass = 'combo-box-'+ len ;
	var elClass = 'combo-box-el-'+len ;
	var box = $('<div class="combo-box '+addClass+'" style="border:1px solid #ccc;border-top:none;display:none;width:'+($this.outerWidth()-3)+'px;height:'+options.height+'px"></div>').appendTo(document.body);
	$this.addClass(elClass);

	var getData = function(isInit){
		var data = $this.data('data-tree');
		if(data){
			render(getTreeConfig(data));
		}else{
			if(options.data){
			 	$this.data('data-tree',options.data);
				render(getTreeConfig(options.data),isInit);
			}else{
				$.ajax({
					url:options.url,
					dataType:'json',
					success:function(res){
						var data = jsonTree(res, {
						    id: 'id',
						    pid: 'pid',
						    children: 'children'
						})
						$this.data('data-tree',data);

						render(getTreeConfig(data),isInit);
					}
				})

			}
		}	
	}
	var getTreeConfig = function(data){
		var defaultConfig = {
			"id_field": "id",
			chk_node_next:true,
			onClickRow: function(id, index, data){
				if(!options.multiple){
					hide();	
				}
				setSelected(data);
			}
		}
		return  $.extend(defaultConfig,tree||{},{
			chk_show:options.multiple,
			dataset:data,
			ids:options.selects		
		});	
	}
	var setSelected = function(data){
		var text = '' ,id='' ;
		if(data){ 
			if(!options.multiple){
				text = data.text ;
				id = data.id ;	
			}else{
				var selections = tree.getSelections();
				for(var i=0 ;i<selections.length;i++){
					var dot = (i<selections.length-1||selections.length==0?',':'');
					id+= selections[i].data.id + dot; 
					text+= selections[i].data.text +dot; 
				}
			}	
		}else{//默认
			var selections =options.selects||[];
			for(var i=0 ;i<selections.length;i++){
				var row = tree.getRowDataById(selections[i]);
				var dot = (i<selections.length-1||selections.length==0?',':'');
				id+= row.id + dot; 
				text+= row.text +dot; 
			}
		}
		
		$this.find('input').val(text);
		options.ref.val(id);	
	}

	var render = function(config,isInit){
		tree = box.showTree(config);
	    tree.expandAll();
	    box.css({
			position:'absolute',
			left:$this.offset().left,
			top:$this.offset().top+$this.outerHeight()
		})
		if(isInit){
			setSelected();
		}else{
			show();
		}
	}

	
	
	var hide = function(){
		box.hide();
		$this.removeClass('unfold');	
	}
	var show = function(){
		if(!options.multiple&&options.ref.val()!==''){
			var tr = tree.getElementTr(options.ref.val());
			setTimeout(function(){
				tr.length>0&&box.scrollTop(tr.offset().top>100?tr.offset().top-100:0);
			},100);	
		}
		box.show();
		$this.addClass('unfold');	
	}
	
	$this.unbind('hide').bind('hide',function(){
		hide();	
	})

	$this.click(function(){
		if(box.is(':visible')){
			hide();
		}else{
			getData();	
		}	
	}) 

	jQuery(document).unbind('click.combo'+len).bind('click.combo'+len,function(e){
		var curEl = e.target;
		if(!jQuery.contains(box[0]||jQuery('body')[0],curEl)&&!jQuery(curEl).is('.'+elClass)&&!jQuery.contains($this[0],curEl)){
			if($this.is(':visible')){
				hide();
			}
		}
	})

	getData(true);
};
