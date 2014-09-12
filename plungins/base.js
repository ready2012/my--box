
$(function(){
    jQuery.fn.extend({
        /*
         * Ctrl+Enter快速提交表单
         */
        quickSubmit: function(){
            jQuery(this).keydown(function(e){
                if (!e.shiftKey && !e.altKey && e.ctrlKey && e.keyCode == 13) {
                    var obj = jQuery(e.target);
                    var form = obj.is('form') ? obj : obj[0].form;
                    jQuery(form).submit();
                }
            });
            return this;
        },

        /*
         * 限制文本框长度
         */
        limitLength: function(len, echo ,showTotal){
            return this.each(function(){
                var obj = jQuery(this);
                if(obj.is('input:text') || obj.is('textarea')){
                    var that = this;
                    var events = ['keyup','focus','blur'];
                    jQuery.each(events, function(i,n){
                        jQuery(that).bind(n, function(){
                            if(this.value.length > len)
                                this.value = this.value.substring(0, len);
                            if(n=='keyup'){
                                jQuery(this).scrollTop(jQuery(this).height());
                            }
                            if(echo){
                                if(showTotal==true){
                                    jQuery(echo).html((this.value == jQuery(this).data('tooltip') ? 0 : this.value.length) + '/' + len);
                                }else{
                                    jQuery(echo).html(len-(this.value == jQuery(this).data('tooltip') ? 0 : this.value.length));
                                }

                            }
                        });
                    });
                    obj.triggerHandler('blur');
                }
            });
        },
        limitLength4Chinese: function(params,space){
            function getStrlen(val){
                if(space){
                    var v=val.replace(/\s/g,'');//空格不计数时用
                }else{
                    var v =val;
                }

                if(params&&params.isChinese){
                    return  Math.ceil(Group.util.replaceAfter(v, ',,').length/2) ;
                }else{
                    return v.length ;
                }
            }

            function cutVal(input){
                var val = input.val();
                /*var tempVal =val.match(/\s/g),
                    addlength = 0;
                   if(tempVal!=null){
                       addlength = tempVal.length;
                   }*/
                if(params&&params.isChinese){
                    if (getStrlen(val) > params.max) {
                        var index = 0;
                        for(var i= val.length;i>0 ;i--){
                            if(getStrlen(val.substring(0,i)) <=params.max){
                                index = i ;
                                break ;
                            }
                        }
                        input.val(val.substring(0, index));
                    }
                }else if(val.length > params.max){
                    input.val(val.substring(0, params.max));
                    input.scrollTop(input.height());
                }
            }

            return this.each(function(){
                var obj = jQuery(this);
                if(obj.is('input:text') || obj.is('textarea')){
                    var that = this;
                    var events = ['keyup.limit','focus.limit','blur.limit'];
                    jQuery.each(events, function(i,n){
                        jQuery(that).bind(n, function(){
                            cutVal(jQuery(this));
                            if(params&&params.echo){
                                if(params.showTotal==true){
                                    jQuery(params.echo).html((this.value == jQuery(this).data('tooltip') ? 0 : getStrlen(this.value)) + '/' + params.max);
                                }else{
                                    var that =this;
                                    if($(that).attr('placeholder')==this.value){
                                        jQuery(params.echo).html(params.max);
                                    }else{
                                        setTimeout(function(){
                                            var remain =params.max-(that.value == jQuery(that).data('tooltip') ? 0 : getStrlen(that.value));
                                            jQuery(params.echo).html((remain>0?remain:0));
                                        },50)
                                    }
                                }

                            }
                        });
                    });
                    obj.triggerHandler('blur.limit');
                }
            });
        },
        placeholder2: function(text){
           if(jQuery(this).is(':input')) {
                var obj = jQuery(this);
                var resetColor = obj.css('color');
                obj.focus(function(){
                    var val = jQuery.trim(this.value);
                    if(val == '' || val == text){
                        obj.val('').css({color: resetColor});
                    }
                    //FireFox下如果存在placeholder属性，光标为黑色，只有输入内容后光标才随css color设置颜色
                    //这会导致input onfocus时看不到光标(实际上光标是黑色)
                    //所以暂时以以下方法解决，顺便能让input框onfocus时提示文案消失。
//                    this.removeAttribute('placeholder');
                }).bind('blur.place',function(){
                        var val = jQuery.trim(this.value);
                        if(val == '' || val == text){
                            obj.val(text).css({color: '#999'});
                        }
                        //onblur时把placeholder恢复
//                        this.setAttribute('placeholder', text);
                    }).data('placeholder',text).triggerHandler('blur.place');
            }

            return this;
        }
    });
    /*
        *取url参数 方便定位
        */
    jQuery.extend({
        parseQuerystring: function() {
            var nvpair = {};
            var qs = window.location.search.replace('?', '');
            var pairs = qs.split('&');
            $.each(pairs, function(i, v) {
                var pair = v.split('=');
                nvpair[pair[0]] = pair[1];
            });
            return nvpair;
        }
    });
    /**
     * 自动换行  来自jquery插件autoSize 1.16.5.0
     */
    (function ($) {
        var
            defaults = {
                className: 'autosizejs',
                append: '',
                callback: false
            },
            hidden = 'hidden',
            borderBox = 'border-box',
            lineHeight = 'lineHeight',

        // border:0 is unnecessary, but avoids a bug in FireFox on OSX (http://www.jacklmoore.com/autosize#comment-851)
            copy = '<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden;"/>',

        // line-height is conditionally included because IE7/IE8/old Opera do not return the correct value.
            copyStyle = [
                'fontFamily',
                'fontSize',
                'fontWeight',
                'fontStyle',
                'letterSpacing',
                'textTransform',
                'wordSpacing',
                'textIndent'
            ],
            oninput = 'oninput',
            onpropertychange = 'onpropertychange',

        // to keep track which textarea is being mirrored when adjust() is called.
            mirrored,

        // the mirror element, which is used to calculate what size the mirrored element should be.
            mirror = $(copy).data('autosize', true)[0];

        // test that line-height can be accurately copied.
        mirror.style.lineHeight = '99px';
        if ($(mirror).css(lineHeight) === '99px') {
            copyStyle.push(lineHeight);
        }
        mirror.style.lineHeight = '';

        $.fn.autosize = function (options) {
            options = $.extend({}, defaults, options || {});

            if (mirror.parentNode !== document.body) {
                $(document.body).append(mirror);
            }

            return this.each(function () {
                var
                    ta = this,
                    $ta = $(ta),
                    minHeight,
                    active,
                    resize,
                    boxOffset = 0,
                    callback = $.isFunction(options.callback);

                if ($ta.data('autosize')) {
                    // exit if autosize has already been applied, or if the textarea is the mirror element.
                    return;
                }

                if ($ta.css('box-sizing') === borderBox || $ta.css('-moz-box-sizing') === borderBox || $ta.css('-webkit-box-sizing') === borderBox){
                    boxOffset = $ta.outerHeight() - $ta.height();
                }

                minHeight = Math.max(parseInt($ta.css('minHeight'), 10) - boxOffset, $ta.height());

                resize = ($ta.css('resize') === 'none' || $ta.css('resize') === 'vertical') ? 'none' : 'horizontal';

                $ta.css({
                    overflow: hidden,
                    overflowY: hidden,
                    wordWrap: 'break-word',
                    resize: resize
                }).data('autosize', true);

                function initMirror() {
                    mirrored = ta;
                    mirror.className = options.className;

                    // mirror is a duplicate textarea located off-screen that
                    // is automatically updated to contain the same text as the
                    // original textarea.  mirror always has a height of 0.
                    // This gives a cross-browser supported way getting the actual
                    // height of the text, through the scrollTop property.
                    $.each(copyStyle, function(i, val){
                        mirror.style[val] = $ta.css(val);
                    });
                }

                // Using mainly bare JS in this function because it is going
                // to fire very often while typing, and needs to very efficient.
                function adjust() {
                    var height, overflow, original;
                    if (mirrored !== ta) {
                        initMirror();
                    }

                    // the active flag keeps IE from tripping all over itself.  Otherwise
                    // actions in the adjust function will cause IE to call adjust again.
                    if (!active) {
                        active = true;
                        mirror.value = ta.value + options.append;
                        mirror.style.overflowY = ta.style.overflowY;
                        original = parseInt(ta.style.height,10);

                        // Update the width in case the original textarea width has changed
                        // A floor of 0 is needed because IE8 returns a negative value for hidden textareas, raising an error.
                        mirror.style.width = Math.max($ta.width(), 0) + 'px';

                        // The following three lines can be replaced with `height = mirror.scrollHeight` when dropping IE7 support.
                        mirror.scrollTop = 0;
                        mirror.scrollTop = 9e4;
                        height = mirror.scrollTop;
                        var maxHeight = parseInt($ta.css('maxHeight'), 10);
                        // Opera returns '-1px' when max-height is set to 'none'.

                        maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;
                        if (height > maxHeight) {
                            height = maxHeight;
                            overflow = 'scroll';
                        } else if (height < minHeight) {
                            height = minHeight;
                        }
                        height += boxOffset;
                        ta.style.overflowY = overflow || hidden;
                        if (original !== height) {
                            ta.style.height = height + 'px';
                            if (callback) {
                                options.callback.call(ta);
                            }
                        }

                        // This small timeout gives IE a chance to draw it's scrollbar
                        // before adjust can be run again (prevents an infinite loop).
                        setTimeout(function () {
                            active = false;
                        }, 1);
                    }
                }

                if (onpropertychange in ta) {
                    if (oninput in ta) {
                        // Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
                        // so binding to onkeyup to catch most of those occassions.  There is no way that I
                        // know of to detect something like 'cut' in IE9.
                        ta[oninput] = ta.onkeyup = adjust;
                    } else {
                        // IE7 / IE8
                        ta[onpropertychange] = adjust;
                    }
                } else {
                    // Modern Browsers
                    ta[oninput] = adjust;
                }

                $(window).resize(function(){
                    active = false;
                    adjust();
                });

                // Allow for manual triggering if needed.
                $ta.bind('autosize', function(){
                    active = false;
                    adjust();
                });

                // Call adjust in case the textarea already contains text.
                adjust();
            });
        };
    }(window.jQuery));
});





var Group = Group||{} ;
Group.util={
    getLength:function(s){
        var cl= this.getClength(s);
        var ll= s.length-cl;
        return cl*2+ll ;
    },
    getClength:function(s){
        return  s.length-this.replaceAfter(s,'').length;
    },
    replaceAfter:function(s,replaceStr){
        var result = [] ;
        var s =  s.split(''),len = s.length;

        for(var i=0;i< len;i++){
            if(s[i].charCodeAt()>255){
                result.push(replaceStr);
            }else{
                result.push(s[i]);
            }
        }
        return result.join('') ;
    },
    substr2:function(params){
        var val = params.str;
        var newV = val;
        if(params.isChinese){
            if (Group.util.getLength(params.str)> params.max) {
                var index = 0;
                for(var i= val.length;i>0 ;i--){
                    if(Group.util.getLength(val.substring(0,i)) <=params.max){
                        index = i ;
                        break ;
                    }
                }
                newV = val.substring(0, index)+'...';
            }
        }else if(val.length > params.max){
            newV = val.substring(0, params.max)+'...';

        }
        return  newV
    },
    alert:function(message,options){
        var defaultOptions = {
            width:442,
            title: '大街提示',
            mask: true,
            height:600,
            defbtn:false,
            customClass:'confirm-dialog2'
        }

        // var dialog = $.alert(content,$.extend({},defaultOptions,options));
        var dialog = $.alert(['<div class="confirm-box">',
            '<p class="tip-text">',
            '<img src="http://assets.dajieimg.com/up/feed/image/del-tip.png"/>',
            '<span>'+message+'</span>',
            '</p>',
            '<p class="action">',
            '<a href="javascript:;" class="dj-btn dj-btn-m dj-btn-main submit-btn">确定</a><a class="dj-btn dj-btn-m cancel-btn" href="javascript:;">取消</a>',
            '</p>',
            '</div>'].join(''),$.extend({},defaultOptions,options));
        dialog.find('a.submit-btn').click(function(){
            dialog.find('.close').triggerHandler('click');
            if(options&&options.confirmCb){
                options.confirmCb();
            }
        })
        dialog.find('a.cancel-btn').click(function(){
            dialog.find('.close').triggerHandler('click');
        })
    },
    autoTip:function(message,options){
        var defaultOptions = {
            width:442,
            title: '大街提示',
            mask: true,
            height:600,
            defbtn:false,
            customClass:'confirm-dialog2'
        }
        // var dialog = $.alert(content,$.extend({},defaultOptions,options));
        var dialog = $.alert(message,$.extend({},defaultOptions,options));
        return dialog ;
    },
    confirm:function(message,options){
        var defaultOptions = {
            width:442,
            title: '大街提示',
            mask: true,
            height:600,
            defbtn:false,
            customClass:'black-confirm'
        }
        var dialog = $.alert(["<div class='black-list-tip'><div class='black-info'>"+
                "<p class='f14'>"+message+"</p>" +
                "<p class='black-check'><input type='checkbox' id='black'>&nbsp;&nbsp;<label for='black'>同时加为黑名单</label></p>" +
                "</div></div>"+
                "<p class='action btn-box'>"+
            "<a href='javascript:;' class='dj-btn dj-btn-m dj-btn-main submit-btn'>确定</a>&nbsp;&nbsp;<a class='dj-btn dj-btn-m cancel-btn' href='javascript:;'>取消</a>",
            "</p></div>"].join(''),$.extend({},defaultOptions,options));
        dialog.find('a.submit-btn').click(function(){
            var black = 0;
            if($('#black').attr('checked')){
                    black=1//禁止再次加入
                }
            dialog.find('.close').triggerHandler('click');
            if(options&&options.confirmCb){
                options.confirmCb(black);
            }
        })
        dialog.find('a.cancel-btn').click(function(){
            dialog.find('.close').triggerHandler('click');
        })

    },
    error:function(message,options){
        var defaultOptions = {
            width:442,
            title: '提示',
            mask: false,
            height:600,
            defbtn:false,
            customClass:'action-error-dialog'
        }

        // var dialog = $.alert(content,$.extend({},defaultOptions,options));
        var dialog = $.alert(['<div class="action-error-box">',
            '<p class="tip-text">',
            '<img src="http://assets.dajieimg.com/up/feed/image/del-tip.png"/>',
            '<span>'+message+'</span>',
            '</p>',
            '<p class="action">',
            '<a href="javascript:;" class="submit-btn">确定</a>',
            '</p>',
            '</div>'].join(''),$.extend({},defaultOptions,options));
        dialog.find('a.submit-btn').click(function(){
            dialog.remove();
        })
    },
    joinDialog:function(groupId,username,rea){
        var joined=false,
            joinHandle='join-btn',
                joinText='立即加入';
        //是否在审核中  joined 为true时表示在审核中
        if(typeof isAudit!=='undefined'){
            joined=isAudit;
        }else{
            joined =Group.data.isAudit;
        }
        if(Group.data.isBlack){
            joinHandle = 'dj-btn-disabled';
            joinText ='无法加入'
        }

        var that =this ;
        if(joined){
            var dialog = $.alert(['<div class="success-box">',
                '<p class="success-tip1">',
                '加入圈子后即可操作!',
                '</p>',
                '<p class="success-tip2">',
                '你的加入申请正在审核，请耐心等候。',
                '</p>',
                '<p class="action">',
                '<a href="javascript:;" class="know-btn">我知道了</a>',
                '</p>',
                '</div>'].join(''),{
                width:440,
                title: '大街提示',
                mask: true,
                defbtn:false,
                customClass:'join-group-dialog'
            });
            dialog.find('.close').click(function(){
                if(that.knowCB)   that.knowCB();
            })
            dialog.find('.know-btn').click(function(){
                dialog.find('.close').triggerHandler('click');
            })
        }else{
            var dialog = $.alert(['<div class="success-box">',
                '<p class="success-tip1">',
                '你还不是圈子成员。',
                '</p>',
                '<p class="success-tip2">',
                '加入圈子，进一步挖掘有价值的内容。',
                '</p>',
                '<p class="action">',
                '<a href="javascript:;" class="dj-btn dj-btn-m dj-btn-main '+joinHandle+'">'+joinText+'</a>',
                '</p>',
                '</div>'].join(''),{
                width:440,
                title: '大街提示',
                mask: true,
                defbtn:false,
                customClass:"join-group-dialog"
            });
            dialog.find('.close').click(function(){
                dialog.find('.close').triggerHandler('click');
            })
            dialog.find('.join-btn').click(function(){
                new Group.joinGroup({
                    groupId:groupId,
                    rea: rea,
                    username: username,
                    success:function(){
                    },
                    knowCB:function(){
                        window.location.reload();
                    },
                    noconfirmSuccessCB:function(){
                        var tip = $('<span class="direct-success-tip">加入成功</span>').insertAfter(dialog.find('.join-btn'));
                        tip.fadeOut(1500,function(){
                            window.location.reload();
                        });
                    }
                });
            })
        }
    }
};


/**
 *  赞
 */

Group.favorAction =function(params){
    /*
     *
     *  new Group.favorAction({
     favorUrl:'/up/group/demo/json-favor-action.html', // 测试用
     unfavorUrl:'/up/group/demo/json-favor-action.html?un',
     listUrl:'/up/group/demo/json-favor-list.html',
     moreUrl:'/up/group/demo/json-favor-list-more.html',
     scrollUrl:'/up/group/demo/json-favor-list-more.html'
     })
     * */
    $.extend(this,{
        pBox: $('#content'), // 父容器  原为#feed 改版后终端页无#feed
        favorUrl:'/group/ajax/praise', // 测试用
        unfavorUrl:'/group/ajax/unpraise',
        //listUrl:'/up/group/demo/json-favor-list.html',
        listUrl:'/group/ajax/latelypraiseuser',
        //moreUrl:'/up/group/demo/json-favor-list-more.html',
        moreUrl:'/group/ajax/praiseuser',
        scrollUrl:'/group/ajax/praiseuser'
    },params);
    this.init();
};
Group.favorAction.prototype = {
    init:function(){
        this.time =300;//默认消失延时时间
        this.hoverTime = 300;
        // this.isReq =false; // 是否已经请求了hover赞时的数据
        if(!this.showBox){
            this.showBox = jQuery('<div  class="favor-f-dialog"><div class="favor-content"></div><span class="arrow"></span></div>').appendTo(document.body) ;
            this.contentBox = this.showBox.find('.favor-content') ;
        };
        if (!this.alertBox) {
            this.alertBox = $('<div class="favor-list"><ul></ul></div>');
            this.alertList = this.alertBox.find('ul');
        };
        this.bindEvents()
    },
    bindEvents:function(){
        var that =this;
        //赞与取消赞
        this.pBox.delegate('.favor-f,.favored-f','click',function(){
            if(!Group.data.isLogin){
                dj_hd_reg_login_dialog('login');
                return ;
            }/*else if(!Group.data.isMember){
                var isNeed = Group.data.isNeedReason?'1':'0' ;
                Group.util.joinDialog(Group.data.groupId,Group.data.uname,isNeed);
                return ;
            }*/
            if($(this).data('isReq')==true) return ;
            var ele = this ;
            $(this).data('isReq',true) ;
            var isLike =  !$(this).hasClass('favored-f'),
                num = parseInt($(this).attr('data-num'),10) || 0,
                objectType = $(this).attr('data-type'),
                objectId =$(this).attr('data-id'),
                data = {
                    'type' : objectType,
                    'objectId' : objectId
                };

            // 赞的请求
            that.toggleFavor(isLike,data,function(){
                if(isLike){
                    num++ ;
                    $(ele).addClass('favored-f').html('已赞').attr('data-num',num) ;
                    $(ele).next('.favor-num').html('('+num+')');
                    if(that.favorCB){
                        that.favorCB(ele);
                    }
                } else{
                    num--;
                    $(ele).removeClass('favored-f').html('赞').attr('data-num',num) ;
                    if(num==0) {
                        $(ele).next('.favor-num').html('');
                    }else{
                        $(ele).next('.favor-num').html('('+(num)+')');
                    }
                    if(that.unfavorCB){
                        that.unfavorCB(ele);
                    }
                }
            },function(){
                $(ele).data('isReq',false) ;
            }) ;
        });
        //数字hover 显示已赞的人
        this.pBox.delegate('.favor-num','mouseover',function(){
            var obj =this ;
            if($(obj).attr('data-num')==0) return ;
            that.stopTimer() ;
            that.hoverTimer = setTimeout(function(){
                that.render($(obj)) ;
            },that.hoverTime) ;
        }).delegate('.favor-num','mouseout',function(){
                that.stopTimer() ;
                clearTimeout(that.hoverTimer) ;
                that.startTimer() ;
            });
        that.showBox.hover(function(){
            that.stopTimer() ;
        },function(){
            that.stopTimer() ;
            that.startTimer() ;
        });

        this.pBox.delegate('.favored-f','mouseover',function(){
            $(this).text('取消赞');
        }).delegate('.favored-f','mouseout',function(){
                $(this).text('已赞');
            });
    },
    toggleFavor:function(islike,data,success,complete,error){
        var url = !!islike ? this.favorUrl : this.unfavorUrl;
        jQuery.ajax({
            // url:'/favor/'+id+(islike?'/like':'/unlike')+ (data?'?'+data:''),
            // url:'/up/feed/demo/favor'+(islike?'.html':'un.html') + (data?'?'+data:''),
            url : url,
            type:'post',
            data : data,
            dataType: 'json',
            success:function (r){
                if(parseInt(r.status,10) == 0) {
                    if(success){
                        success(r);
                    }else{
                        if(isLike){
                            //jQuery.messageDialog({message:'喜欢成功'});
                        }else{
                            //jQuery.messageDialog({message:'已经取消喜欢了'});
                        }
                    }
                }else{
                    alert('与服务器通讯时出错, 请重试');
                }
            },
            complete:function(){
                if(complete){
                    complete();
                }
            },
            error :function (){
                if(error){
                    error();
                }else{
                    alert('与服务器通讯时出错, 请重试');
                }
            }
        });
    },
    // 渲染hover赞时的弹层
    render:function($obj){
        var that = this,
            url = this.listUrl

        // 因为有可能存在多个，但是缓存只能缓存到一个对象中，所以只能不做缓存
        this.req(url,that.getData($obj),function(res){
            var html = that.getHtml(res);
            if (html) {
                that.show($obj,html);
            } else {
                alert(res.msg);
            }
        });
    } ,
    // 渲染点击"更多"之后的列表弹层
    renderAlert : function ($obj) {
        var that = this,
            url = this.moreUrl,
        data = that.getData($obj);

        data.page = 1;

        // 因为有可能存在多个，但是缓存只能缓存到一个对象中，所以只能不做缓存
        that.req(url,data,function(r){
            var html = that.getHtml(r);
            var dialog = that.showMoreFavorer(html);
            that.bindScroll(data,dialog); // 绑定滚动
        });
    },
    setPosition:function(obj){
        var offset = obj.offset();
        var left = offset.left-25 ;
        var top = offset.top+23 ;

        this.showBox.css({left:left,top:top}) ;
    },
    show:function(obj ,html){
        var that = this ;
        this.contentBox.html(html) ;
        this.setPosition(obj) ;

        // 点击"更多"显示赞的人的列表
        this.contentBox.find('.favor-more-btn').attr({
            'data-id':obj.attr('data-id'),
            'data-type':obj.attr('data-type')
        }).click(function(e){
            e.preventDefault();
            that.showBox.hide();
            that.renderAlert($(this));
        });
        this.showBox.show() ;
    },
    getHtml:function(r){
        if (parseInt(r.status) === 0) {
            return r.data;
        } else {
            return false;
        };
    },
    showMoreFavorer:function(html){
        var that = this,
            wrap = $('<div>'); // 用于取得html片段
        that.alertList.html(html);
        wrap.append(that.alertBox);

        var dialog = $.alert(wrap.html(),{
            width:500,
            defbtn :false,
            title:'他们觉得这很赞',
            customClass :'favaor-dialog-more',
            onabort:function(){
            }
        });
        return dialog ;
    },
    stopTimer:function(){
        clearTimeout(this.timer);
        this.timer = null ;
    },
    startTimer:function(){
        var that = this ;
        this.timer = setTimeout(function(){
            that.showBox.hide() ;
        },this.time) ;
    },
    // 赞的弹出层的滚动更新
    bindScroll : function (data,dialog) {
        var that = this,
            loading = false,
            url = this.scrollUrl,
        page = 2,
            canScroll = true;
        // 滚动刷新弹层中的显示赞的人的列表
        $('.favaor-dialog-more .client').scroll(function(e) {
            // 做一下限制
            if (!canScroll) {
                return;
            };

            var $client = $(this),
                $alertList = $client.find('.favor-list ul'),
                height = $client.height(),
                innerHeight = $client.find('.favor-list').height()
            scrollTop = $client.scrollTop();

            if (scrollTop >= (innerHeight - height) && !loading && page <= 15) {
                loading = true;
                data.page = page;
                that.req(url,data,function (res) {
                    var html = that.getHtml(res);
                    if (html) {
                        $alertList.append(html);
                    } else {
                        canScroll = false;
                    };
                    page++;
                    loading = false;
                });
            }
        });
    },
    // 添加几个方法
    // by jn
    // ajax请求，用于请求"赞"过的人的列表
    req : function (url,data,callback) {
        var that = this;
        $.ajax({
            'url' : url,
            'data' : data,
            'type' : 'get',
            'dataType' : 'json',
            'success' : function (res) {
                callback.call(that,res);
            },
            'error' : function (err) {
                console.log(err);
            }
        })
    },
    // 返回要请求的url
    // getUrl : function (target) {

    // },
    // 返回要随ajax发送的数据
    getData : function (target) {
        var objectId = target.attr('data-id'),
            objectType = target.attr('data-type');

        return {'objectId':objectId,'type':objectType};
    }
};

Group.app=Group.app||{};
Group.app.namecard = function(params){
    var defaultParams = {
        mark:'.group-person-img',
        boxClass:'group-name-card', //显示的容器
        timer : null ,
        time:300  ,   //默认消失延时时间
        hoverTime :300 ,
        hoverTimer:null ,
        isCache:false
    };

    jQuery.extend(this ,defaultParams ,params ) ;
    this.init();
};
Group.app.namecard.prototype = {
    init:function(){
        if(!this.showBox){
            this.showBox = jQuery('<div  class="'+this.boxClass+'"></div>').appendTo(document.body) ;
        }
        this.bindEvents() ;
    },
    bindEvents:function(){
        var that = this ;
        $(document).delegate(that.mark,'mouseenter',function(){
            var obj = this ;
            that.stopTimer() ;
            that.hoverTimer = setTimeout(function(){
                that.render(jQuery(obj)) ;
            },that.hoverTime) ;
        }).delegate(that.mark,'mouseleave',function(){
            that.stopTimer() ;
            clearTimeout(that.hoverTimer) ;
            that.startTimer() ;
        })

        that.showBox.hover(function(){
            that.stopTimer() ;
        },function(){
            that.stopTimer() ;
            that.startTimer() ;
        })
    },
    render:function($obj){
        var  that = this ;

        this.req(that.getUrl($obj),that.getData($obj),function(r){

            var html = that.getHtml($obj.attr('data-forward'),r,$obj.attr('data-uid')) ;
            that.show($obj,html) ;
        });
    } ,
    req:function(url,data,cb){
        jQuery.ajax({
            url:url ,
            data:data,
            dataType:'json' ,
            success:function(r){
                if(r.result==true){
                    if(cb){
                        cb(r) ;
                    }
                }
            }
        })
    },
    getUrl:function(){
        return '/group/ajax/terminaluser';
       // return '/up/group/demo/json-namecard.html' ;
    },
    getData:function(obj){
        return 'uid='+obj.attr('data-uid') ;
    },
    getHtml:function(forward,data,uid){
        data.desc = Group.util.substr2({str:data.desc,max:24,isChinese:true});
        return [
                    '<div class="content '+(forward=='right'?'content-img-right':'')+'">',
                        '<img src="'+data.uhead+'">',
                            '<div class="txt">',
                                '<a target="_blank" href="'+data.url+'" class="name">'+data.uname+'</a>',
                                '<p class="from">'+data.desc+'</p>',
                                '<p class="num">话题 '+data.tagnum+' | 粉丝 '+data.followernum+'</p>',
                            '</div>',
                        '</div>',
                        '<p class="action clearfix"><a href="javascript:;" class="namecard-btn '+(data.followed?'cancel-btn':'follow-btn')+'" data-sex="'+data.sex+'"  data-uid="'+uid+'">'+(data.followed?'取消关注':'关注'+data.sex)+'</a></p>',
                    ].join('');
    },
    show:function(obj ,html){
        var that =this ;
        this.showBox.html(html) ;
        this.setPosition(obj) ;
        this.showBox.find('.namecard-btn').click(function(){
            that.followReq($(this),$(this).hasClass('follow-btn'));
        });
        this.showBox.show() ;
    },
    setPosition:function(obj){
        var offset = obj.offset();
        var left = offset.left ;
        var top = offset.top;
        var forward =obj.attr('data-forward');
        if(forward=='right'){
            left = left -(this.showBox.width()-obj.width())
        }
        this.showBox.css({left:left,top:top}) ;
    },
    stopTimer:function(){
        clearTimeout(this.timer);
        this.timer = null ;
    },
    startTimer:function(){
        var that = this ;
        this.timer = setTimeout(function(){
            that.showBox.hide() ;
        },this.time) ;
    },
    hideBox:function(){
        this.showBox.hide() ;
    },
    followReq:function(dom,flag) {
        if($(dom).data('isReq')==true) return ;

        var url = '/group/followmember';
        var uid = $(dom).attr('data-uid');
        var sex = $(dom).attr('data-sex');
        if(!flag){
            url= '/group/unfollowmember';
        }
        //url ="/up/group/demo/json.html"
        $(dom).data('isReq',true);
        $.ajax({
            url:url,
            type:"post",
            dataType:"json",
            data:{"toUid":uid},
            success:function (r) {
                if (r.result) {
                    if(flag){
                        $(dom).text('取消关注').removeClass('follow-btn').addClass('cancel-btn');
                    }else{
                        $(dom).text('关注'+sex).removeClass('cancel-btn').addClass('follow-btn');
                    }
                }
            },
            complete:function(){
                $(dom).data('isReq',false)
            }
        });
    }
};

