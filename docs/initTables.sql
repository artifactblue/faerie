CREATE TABLE IF NOT EXISTS Users (
	id text primary key,
	displayName text,
	createTimestamp timestamp with time zone
);

CREATE TABLE IF NOT EXISTS Category (
	id serial primary key,
	name text,
	thumbnail text,
	categoryUrl text,
	createTimestamp timestamp with time zone
);

CREATE TABLE IF NOT EXISTS Rss (
	id serial primary key,
	categoryId integer,
	rssName text,
	rssUrl text,
	thumbnail text,
	createTimestamp timestamp with time zone,
	lastUpdateTimestamp timestamp with time zone
);

CREATE TABLE IF NOT EXISTS RssFeed (
	id serial primary key,
	rssId integer,
	rssFeedTitle text,
	rssFeedUrl text,
	releaseDate date,
	thumbnail text,
	createTimestamp timestamp with time zone
);

CREATE TABLE IF NOT EXISTS UserSubscription (
	id serial primary key,
	userId text,
	categoryId integer,
	status text, -- SUBSCRIBE, UNSUBSCRIBE, PENDING
	createTimestamp timestamp with time zone
);

CREATE TABLE IF NOT EXISTS RssView (
	id serial primary key,
	userId integer,
	rssId integer,
	viewTimestamp timestamp with time zone
);