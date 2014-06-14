// 

function do_pixiv_grab (info, tab)
{


}


function parse_photo_url ()
{
}

function Artwork ($id)
{
}

Artwork.prototype.getTitle    = function(){return this.title;}
Artwork.prototype.getAuthor   = function(){return this.author;}
Artwork.prototype.getTagsStr  = function(){return this.tags.join("_");}
Artwork.prototype.getPageContent = function ()
{
}


var artwork = new Artwork('12345678');
artwork.getTitle();

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