// 

var sites_pattern = {
  "pixiv":  {"key": 2, "pattern": /(\/works\/|illust_id\=)([0-9]*)/, "domain_pattern": /www\.pixiv\.(com|net)/, "url":"http://www.pixiv.com/works/{%s}/large"}
};
function do_pixiv_grab (info, tab)
{
  for (var i in sites_pattern)
  {
    var match1  = info.pageUrl.match(sites_pattern[i]['domain_pattern']);
    var match2  = info.pageUrl.match(sites_pattern[i]['pattern']);
    if (match1 !== null && match2 !== null)
    {
      var url = sites_pattern[i]['url'].replace('{%s}', match2[sites_pattern[i]['key']]);
      return new PageRetriever(i, url);
    }
  }
  return true;
}

function Artwork ($site, $id, $title, $author, $tags, $downloadUrls)
{
  this.site   = $site
  this.id     = $id;
  this.title  = $title;
  this.author = $author;
  this.tags   = $tags;
  this.downloadUrls = $downloadUrls;
}
Artwork.prototype.getSite     = function(){return this.site;}
Artwork.prototype.getId       = function(){return this.id;}
Artwork.prototype.getTitle    = function(){return this.title;}
Artwork.prototype.getAuthor   = function(){return this.author;}
Artwork.prototype.getTagsStr  = function(){return this.tags.join("_");}
Artwork.prototype.getDlUrls   = function(){return this.downloadUrls;}

var htmlContent = '';
function setContent (html)
{
  htmlContent = html;
}

function PageRetriever (site, url)
{
  $.ajax({
    "url":      url,
    "type":     "get",
    "beforeSend": function (request)
    {
      request.setRequestHeader("Referer", url.replace('/large'));
    },
    "success":  function(html)
    {
      parser  = new PageParser(site, html);
      // 開啟下載
      $downloadUrls   = parser.getDlUrls();
      // if ($downloadUrls.length == 0)
      // {
        // return false;
      // }
      for (var i in $downloadUrls)
      {
        var filename = parser.getSite() + "_" + i + "_" + parser.getId() + "_" + parser.getTitle() + ".jpg";
        chrome.downloads.download({
          "url":        $downloadUrls[i],
          "filename":   filename
        }, check_download_finish);
      }
    }
  });
  
}

function PageParser (site, content)
{
  this.$id = '', this.$title = '', this.$author = '';
  this.$tags     = [];
  this.$dlUrls   = [];
  
  switch (site)
  {
    case 'pixiv':
      this.pixiv(content);
      break;
  }
  return new Artwork(site, this.$id, this.$title, this.$author, this.$tags, this.$dlUrls);
}
PageParser.prototype.pixiv    = function (content)
{
  var urls  = [], main_id = '', title = '';
  $.each($('img', content), function(i, e){
    if (i == 0)
    {
      title       = $(e).attr('alt');
      var params  = $(e).attr('src').split('/');
      main_id     = params[params.length - 1].substr(0, params[params.length - 1].length - 15);
    }
    var src = $(e).attr('src');
    urls.push(src);
  });
  this.$title   = title;
  this.$id      = main_id;
  this.$dlUrls  = urls;
}

function check_download_finish (dlitem_id)
{
  console.log(dlitem_id);
}

chrome.contextMenus.create({
  "id":                     "pixiv.retriever.download",
  "title":                  "下載此作品的圖片",
  "documentUrlPatterns":    [
    // "*://www.pixiv.net/member_illust.php?mode=medium&illust_id=*",
    // "*://www.pixiv.net/member_illust.php?illust_id=*&mode=medium",
    "*://www.pixiv.com/works/*"
  ],
  "onclick":                do_pixiv_grab
});