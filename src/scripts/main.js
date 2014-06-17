// 

var sites_pattern = {
  "pixiv":  {"pattern": /(\/works\/|illust_id\=)([0-9]*)/, "domain_pattern": /www\.pixiv\.(com|net)/, "url":""}
};
function do_pixiv_grab (info, tab)
{
  for (var i in sites_pattern)
  {
    if (info.pageUrl.match(sites_pattern[i]['domain_pattern']) && info.pageUrl.match(sites_pattern[i]['pattern']))
    {
      return PageRetriever(i, sites_pattern[i][url]);
      break;
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

function PageRetriever (site, url)
{
  $.ajax({
    "url":      url,
    "type":     "get",
    "success":  function (content)
    {
      var parser  = new PageParser(site, content);
      // 開啟下載
      $downloadUrls   = parser.getDlUrls();
      if ($downloadUrls.length == 0)
      {
        return false;
      }
      for (var i in $downloadUrls)
      {
        var filename = parser.getSite() + "_" + parser.getId() + parser.getTitle() + ".jpg";
        chrome.downloads.download({
          "url":        $downloadUrls[i],
          "filename":   filename
        }, check_download_finish);
      }
    }
  })
}

function PageParser (site, content)
{
  var $id, $title, $author;
  var $tags     = [];
  var $dlUrls   = [];
  
  switch (site)
  {
    case 'pixiv':
      this.pixiv(content);
      break;
  }
  return new Artwork(site, $id, $title, $author, $tags, $dlUrls);
}
PageParser.prototype.pixiv    = function (content)
{
}



chrome.contextMenus.create({
  "id":                     "pixiv.retriever.download",
  "title":                  "下載此作品的圖片",
  "documentUrlPatterns":    [
    "*://www.pixiv.net/member_illust.php?mode=medium&illust_id=*",
    "*://www.pixiv.net/member_illust.php?illust_id=*&mode=medium",
    "*://www.pixiv.com/works/*"
  ],
  "onclick":                do_pixiv_grab
});