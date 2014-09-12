// 滚轮模拟 

var dj = {};
(function(){
    var isFF = $.browser.mozilla;
    dj.ScrollBar = function(params){
        var defautParams = {
            box :$('#applier-list-area'),
            scrollMainS:'.resume-scroll-box',
            contentS:'.scrollMain',
            barS:'.resume-scroll-bg',
            cursorS:'.resume-scroll-bar'
        }
        $.extend(this,defautParams,params);
        this.init();
    }

    $.extend(dj.ScrollBar.prototype,{
        init:function(){
            this.setBar();
            this.bindEvent();
        },
        setBar:function(){
            var that = this ;
            setTimeout(function(){
                var $wrap = that.box.find(that.scrollMainS);
                if(!$wrap.length) return false;
                var $move = $wrap.find(that.contentS);
                var $cur = $wrap.find(that.cursorS);
                var $bar = $wrap.find(that.barS);
                var heiMove =  $move.height();
                var heiWrap = $wrap.height();
				console.log(heiMove+'/heiWrap='+heiWrap)
				
                $cur.css('height', heiWrap*heiWrap/heiMove);
                //console.log(heiWrap+'/'+heiMove)
                that.box.data('hasScroll',heiMove>heiWrap);
                if(heiMove>heiWrap){
                    $bar.show();
                }else{
                    $bar.hide();
                }
            }, 0);
        },
        bindEvent:function(){
            var that =this ;
            this.box.delegate(this.scrollMainS,isFF ? 'DOMMouseScroll' : 'mousewheel',function(event, delta){
                event.preventDefault();
                event.stopPropagation();
                if(that.box.data('hasScroll')==false) return;
                var $this = $(this);
                var delta = delta || event.wheelDelta || event.detail;
                var maxDelta = delta < 0 ? -1 : 1;
                if(isFF){
                    maxDelta = -maxDelta;
                }
                funTime();
                function funTime(){
                    var $move = $this.find(that.contentS);
                    var $barBg = $this.find(that.barS);
                    var $bar = $this.find(that.cursorS);
                    var top = parseInt($move.css('top').replace(/px/,'')) || 0;
                    var maxTop= -($move.height()-$this.height());
                    var len = top + maxDelta*20;
                    len = len >= 0 ? 0 : len;
                    len = len <= maxTop ? maxTop : len;
                    $move.css({top:len+'px'});
                    $bar.css({top:($this.height()-$bar.height())*(top/maxTop)});
                    clearTimeout($this.data('scrollBarScrollShow'))
                    $barBg.show();

                    $this.data('scrollBarScrollShow', setTimeout(function (){
                        //$barBg.hide();
                    }, 1000));
                }
            });
            this.box.delegate(this.cursorS,'mousedown', function(e) {
                if(that.box.data('hasScroll')==false) return;
                var $bar = $(this);
                var $parent = $bar.parents(that.scrollMainS);
                var $barBg = $parent.find(that.barS);
                var $move = $parent.find(that.contentS);
                var baseY = e.clientY;
                var baseTop = parseInt($bar.css('top').replace(/px/, '')) || 0;
                var maxTop = $parent.height() - $bar.height();
                $parent.data('scrollBar', true);
                $parent.bind('mousemove.scrollBar', function(e) {
                    var newY = e.clientY;
                    var top = baseTop + newY - baseY;
                    top = top > 0 ? top : 0;
                    top = top < maxTop ? top : maxTop;
                    $move.css({
                        top: -(top / maxTop) * ($move.height() - $parent.height())
                    });
                    $bar.css({
                        'top' : top
                    });
                    $parent.data('scrollBarAutoShow', false);
                    $barBg.addClass('hover');
                }).bind('selectstart.scrollBar', function(e) {
                        return false;
                    });
            });
            this.box.delegate(this.scrollMainS,'mouseup mouseleave', function(){
                if(that.box.data('hasScroll')==false) return;
                var $parent = $(this);
                var $barBg = $parent.find(that.barS);
                $parent.unbind('mousemove.scrollBar').unbind('selectstart.scrollBar');
                $parent.data('scrollBar', false);
                $parent.data('scrollBarAutoShow', true);
                $barBg.removeClass('hover');
            });
            this.box.delegate(this.scrollMainS,'mouseenter', function(e){
                if(that.box.data('hasScroll')==false) return;
                var $parent = $(this);
                var $barBg = $parent.find(that.barS);
                var width = $parent.width();
                var parentX = $parent.offset()['left'];
                var x = e.clientX;
                if(x == undefined) return;
                if(parentX + width - x > 30){
                    //$barBg.fadeIn();
                    setTimeout(function(){
                        //$barBg.fadeOut();
                    }, 1500)
                }
            });
            this.box.delegate(that.scrollMainS,'mousemove', function(e){
                if(that.box.data('hasScroll')==false) return;
                that.autoShowBar(e);
            } );
            this.box.delegate(that.scrollMainS,'mouseleave', function(){
                if(that.box.data('hasScroll')==false) return;
                var $parent = $(this);
                var $barBg = $parent.find(that.barS);
                //$barBg.fadeOut();
            });
        },
        autoShowBar:function(e){
            var $parent =  this.box.find(this.scrollMainS);
            var $barBg = $parent.find(this.barS);
            var width = $parent.width();
            var parentX = $parent.offset()['left'];
            var x = e.clientX;
            if(x == undefined) return;
            if(parentX + width - x < 30){
                $barBg.fadeIn();
                $parent.data('scrollBarAutoShow', true);
            }else{
                if($parent.data('scrollBarAutoShow')){
                    //$barBg.fadeOut();
                    $parent.data('scrollBarAutoShow', false);
                }
            }
        }
    })
})();

/*
 $(function(){
 window.resumeListScrollBar  = new dj.ScrollBar();
 //dj.setScrollBar($('#applier-list-area'))
 })*/
