function do_grab (info, tab)
{
  var url = info.pageUrl;
  var uri = new URI(url);
  var site, id, qs, href, q;
  if (uri.host().match('nicovideo.jp') != null)
  {
    site    = 'nico';
    var params  = url.replace(uri.search(), '').split('/');
    id      = params[params.length - 1];
  } else if (uri.host().match('.pixiv.') != null)
  {
    site    = 'pixiv';
    if (uri.search() !== "" && uri.hasQuery('illust_id') === true)
    {
      var params  = uri.search().match(new RegExp('illust_id=([0-9]*)'));
      if (typeof params[1] !== 'undefined' && params[1] !== '')
      {
        id        = params[1];
      }
    } else
    {
      var params  = url.split('/');
      id          = params[params.length - 1];
    }
  } else if (uri.host().match('.tinami.') != null)
  {
    site          = 'tinami';
    var params    = url.replace("?" + uri.query(), '').split('/');
    id            = params[params.length - 1];
  }
  // 如果網站與id不為空才繼續下載
  if (site !== '' && id !== '')
  {
    $.ajax({
      'url':      'http://api.neko.maid.tw/retrieve.json?' + $.param({site: site, artwork_id: id, r: Math.random()}),
      'type':     'get',
      'dataType': 'json',
      'success':  function (obj)
      {
        if (typeof obj === 'undefined' || typeof obj.error !== "undefined") {
          return false;
        }
        var filename  = obj.from + '_{%s1}_' + obj.title + "_{%s2}";
        chrome.notifications.create('StartDownload', {"type": "basic", "iconUrl": "img/icon32.png", "title": "下載圖片（共"+obj.photos.length+"張）", "message": "下載圖片中，請不要離開本頁，以免圖片下載失敗！"}, function(id){});
        for (var i in obj.photos)
        {
          var urn = new URI(obj.photos[i].url);
          chrome.notifications.update('StartDownload', {"message": "下載圖片中，第"+(i+1)+"/"+obj.photos.length+"張"}, function(id){});
          chrome.downloads.download({
            "url":        obj.photos[i].url,
            "filename":   filename.replace('{%s1}', i).replace('{%s2}', urn.filename(true))
          }, check_download_finish);
        }
        chrome.notifications.clear('StartDownload', function(id){});
      }
    });
  } else
  {
  // 否則跳出錯誤訊息
  }
}

// var timer = [];
function check_download_finish (dlitem_id)
{
  // var k = "dlwatcher_" + dlitem_id;
  // timer[k]  = setInterval(function(){
    // chrome.downloads.search({"id": dlitem_id}, function(obj){
      // if (obj[0].state === 'complete')
      // {
        // clearInterval(timer[k]);
      // }
    // });
  // }, 100);
  console.log(dlitem_id);
}



chrome.contextMenus.create({
  "id":                     "pixiv.retriever.download",
  "title":                  "下載此作品的圖片",
  "documentUrlPatterns":    [
    "*://www.pixiv.net/member_illust.php?mode=medium&illust_id=*",
    "*://www.pixiv.net/member_illust.php?illust_id=*&mode=medium",
    "*://www.pixiv.com/works/*",
    "*://www.tinami.com/view/*",
    "*://seiga.nicovideo.jp/seiga/*"
  ],
  "onclick":                do_grab
});