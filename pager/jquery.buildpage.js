/**
 * User: ikuner
 * Date: 13-6-4
 * Time: 下午5:12
 * 生成翻页组件
 */
;(function(){
  /**
   * 简单的模板
   * @param {String} str 生成模板的字符串
   * @param {Object} replaceObj 生成模板需要的数据
   * @returns {String}
   */
  function gsub(str,replaceObj){
    return str.replace(/(?:\{(\w+)\})/g,function(all,$1){
      return replaceObj[$1];
    })
  }

  /**
   * 生成连续的页码按钮
   * @param {Number} now
   * @param {Number} start
   * @param {Number} end
   * @param {Object} conf 配置参数
   * @returns {String} 返回生成的字符串
   */
  function buildPage(now, start, end, conf){
    var r = '';
    for(var i=start; i<=end; i++){
      var s = i == now ? conf['current'] : conf['page'];
      var data = $.extend({}, conf.data, {num:i});
      r += gsub(gsub(s, data), data);
    }
    return r;
  }

  /**
   * 生成起始的省略号及第一个页码
   * @param {Number} dot 省略号对应的页码
   * @param {Object} conf 配置参数
   * @returns {String}
   */
  function buildStartDot(dot, conf){
    var r = '';
    var dataPage = $.extend({}, conf.data, {num:1});
    var dataDot = $.extend({}, conf.data, {num:dot});
    r += gsub(gsub(conf['page'], dataPage), dataPage);
    r += gsub(gsub(conf['dot'], dataDot), dataDot);
    return r;
  }

  /**
   * 生成结束的省略号及最后一个页码
   * @param {Number} dot 省略号对应的页码
   * @param {Number} all 总页数
   * @param {Object} conf 配置参数
   * @returns {String}
   */
  function buildEndDot(dot, all, conf){
    var r = '';
    var dataPage = $.extend({}, conf.data, {num:all});
    var dataDot = $.extend({}, conf.data, {num:dot});
    r += gsub(gsub(conf['dot'], dataDot), dataDot);
    r += gsub(gsub(conf['page'], dataPage), dataPage);
    return r;
  }

  function buildButton(type, now, conf){
    var data, num;
    switch(type){
      case 'prev':
        num = now-1;
        break;
      case 'next':
        num = now+1;
        break;
    }
    data = $.extend({}, conf.data, {num:num});
    return  gsub(gsub(conf[type], data), data);
  }

  /**
   * 主函数
   * @param {Object} args 参数和 $.buildPage['default']中的一样
   * @returns {Function} 配置后返回构建翻页组件的函数
   */
  $.buildPage = function(args){
    var conf = $.extend({}, $.buildPage['default'], args);
    conf.data = $.extend({}, $.buildPage['default']['data'], conf.data);
    // 出现dot的最小页码
    var max = conf.max;
    // 出现前dot的最小页码
    var addDotNum = Math.floor((max)/2)+1;
    //
    var mid = Math.floor((max-1)/2);
    var add = (max-1)%2;
    return function(now, all){
      var now = +now;
      var all = +all;
      var ifPrev = now != 1;
      var ifNext = now != all;
      var r = '';
      conf['data']['lastNum'] = all;
      if(all <= max){
        r += buildPage(now, 1, all, conf);
      }else{
        if(now <= addDotNum){
          r += buildPage(now, 1, max, conf);
          r += buildEndDot(max+1, all, conf);
        }else if(now + addDotNum > all){
          r += buildStartDot(all-max-1, conf);
          r += buildPage(now, all-max, all, conf);
        }else{
          r += buildStartDot(now-mid-1, conf);
          r += buildPage(now, now-mid, now+mid+add, conf);
          r += buildEndDot(now+mid+add+1, all, conf);
        }
      }
      if(ifPrev){
        r = buildButton('prev', now, conf) + r;
      }
      if(ifNext){
        r = r + buildButton('next', now, conf);
      }
      return conf['wrap'] == '' ? r : conf['wrap'].replace('{content}', r).replace('{lastNum}', conf['data']['lastNum']);
    };
  };
  $.buildPage['default'] = {
    // 大于此数值时出现省略号
    max : 10,
    // 翻页组件包裹的结构
    wrap : '<div class="paging" lastpage="{lastNum}">{content}</div>',
    // 会传到模板里的数据，内部数据都可以在生成模板的时候以{name}的方式使用
    // 注意：num 不可以使用，内部已作为页码的关键字，如果使用的话会被覆盖
    data : {
      attr : 'href',
      value : '#{num}',
      plusPage : '',
      plusCurrent : '',
      plusDot : '',
      plusPrev : '',
      plusNext : '',
      strDot : '&nbsp;',
      strNext : '&nbsp;',
      strPrev : '&nbsp;'
    },
    // 当前页结构
    current : '<span class="current" {plusCurrent}>{num}</span>',
    // 每页按钮结构
    page    : '<a {attr}="{value}" {plusPage}>{num}</a>',
    // 省略号结构
    dot     : '<a class="dot" {attr}="{value}" {plusDot}>{strDot}</a>',
    // 下一页结构
    next    : '<a class="next" {attr}="{value}" {plusNext}>{strNext}</a>',
    // 上一页结构
    prev    : '<a class="prev" {attr}="{value}" {plusPrev}>{strPrev}</a>'
  }
})();