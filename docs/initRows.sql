INSERT INTO Category (id, name, createTimestamp) VALUES (1, '資訊', now());
INSERT INTO Category (id, name, createTimestamp) VALUES (2, '正妹', now());
INSERT INTO Category (id, name, createTimestamp) VALUES (3, '生活', now());

INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (1, 'Engadget', 'http://feeds.feedburner.com/engadget/cstb', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (1, 'bnext', 'http://www.bnext.com.tw/feed/rss/topicslinks', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (1, 'iphone TW', 'http://feeds.feedburner.com/Iphonetw', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (2, '美女寫真館', 'http://a305020.pixnet.net/blog/feed/rss', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (2, '正妹日報', 'http://blog.xuite.net/louiewong/blog/rss.xml', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (2, '正妹星球', 'http://ookkk.blogspot.com/feeds/posts/default', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (3, '動腦-即時新聞', 'http://www.brain.com.tw/Resource/Rss_News.aspx', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (3, '閱讀迷走', 'http://www.readgoing.com/?feed=rss2', '', now());
INSERT INTO Rss (categoryId, rssName, rssUrl, thumbnail, createTimestamp) VALUES (3, '奇摩電影', 'http://tw.movie.yahoo.com/rss/headline', '', now());
