#!/usr/bin/env perl
use Mojolicious::Lite;
use strict;
use utf8;

use 5.010;
binmode STDOUT, ':encoding(UTF-8)';
use DBI;
use Data::Dumper;
use Encode;
use HTML::Entities;
use Time::HiRes qw/gettimeofday/;
# use IO::Compress::Gzip 'gzip';
# Mojolicious::Lite
# plugin 'RequestTimer';
# plugin 'console_logger';

app->config(hypnotoad => {listen => ['http://*:4000']});

app->secrets('adsfsdfas9qu4iganzololo');
app->defaults(gzip => 1);

# hook after_render => sub {
# my ($c, $output, $format) = @_;

# # Check if "gzip => 1" has been set in the stash
# return unless $c->stash->{gzip};

# # Check if user agent accepts GZip compression
# return unless ($c->req->headers->accept_encoding // '') =~ /gzip/i;
# $c->res->headers->append(Vary => 'Accept-Encoding');

# # Compress content with GZip
# $c->res->headers->content_encoding('gzip');
# gzip $output, \my $compressed;
# $$output = $compressed;
# };

# open my $fh2, '>:encoding(UTF-8)', "data.json";

# my $dbh = DBI->connect("dbi:SQLite:top.db","","", {sqlite_unicode => 1}) or die "Could not connect";

my $dbh = DBI->connect("dbi:SQLite:data/top.db","","", {sqlite_unicode => 1,  AutoCommit => 0,  sqlite_use_immediate_transaction => 1}) or die "Could not connect";

# my $ref = $dbh->selectall_arrayref("SELECT id, name_ru, name_be, lat, lon, county FROM beltop where lat is not null", { Slice => {} }  );
my $ref = $dbh->selectall_arrayref("SELECT beltop.id, beltop.name_ru, beltop.name_be, beltop.lat, beltop.lon, beladmdiv.place_id, beladmdiv.name_be as district_be, (SELECT e.name_be FROM beltop e WHERE e.id = beladmdiv.place_id) AS capital_be FROM beltop join beladmdiv on beltop.district_id = beladmdiv.id where beltop.lat is not null and beltop.lat <> 0", { Slice => {} }  );

# my $ref_districts = $dbh->selectall_arrayref("SELECT id, name_be, name_ru, CAST (substr (osm_id_rel, 2) as decimal) as osm_id, pop, nat_lang_pc_be, nat_lang_pc_ru, home_lang_pc_be, home_lang_pc_ru FROM beladmdiv WHERE adm_lvl =2 and is_area = 1", { Slice => {} }  );



# my $ci_ref = $dbh->selectall_arrayref("SELECT substr(belcities.wiki_coat_img_path, -4, 4) as ext, belcities.place_id, belcities.name_be, belcities.est_date, belcities.magd_date, belcities.pop, beltop.lat, beltop.lon, beltop.name_ru FROM belcities INNER JOIN beltop ON belcities.place_id = beltop.id", { Slice => {} }  );
my $ci_ref = $dbh->selectall_arrayref("
SELECT substr(belcities.wiki_coat_img_path, -4, 4) as ext, belren.names_pre_be, belcities.place_id, belcities.name_be, belcities.est_date, belcities.magd_date, belcities.pop, beltop.lat, beltop.lon, beltop.name_ru, ifnull(beltop.histname_be, '') as histname_be
FROM belcities 
INNER JOIN beltop ON belcities.place_id = beltop.id

left JOIN belren ON belcities.place_id = belren.place_id", { Slice => {} }  );


my $ren_ref = $dbh->selectall_arrayref("select id, lat, lon, ren_date, name_be, names_pre_be from belren where lon > 0 and ren_date > 0", { Slice => {} }  );

my $top_ref = $dbh->selectall_arrayref("SELECT beltop.id,  beltop.name_be, beltop.coordinates,beltop.lat,beltop.lon FROM beladmdiv JOIN beltop ON beladmdiv.osm_id_rel = beltop.osm_wayrel_id", { Slice => {} }  );



under sub {
        shift->stash(now => join('.', gettimeofday()));
};

hook before_dispatch => sub {
   my $self = shift;
   # notice: url must be fully-qualified or absolute, ending in '/' matters.
   $self->req->url->base(Mojo::URL->new(q{http://up.top.qw/}));
};  
  
# hook after_dispatch => sub {
    # my $self = shift;
    # # Was the response dynamic?
    # return if $self->res->headers->header('Expires');
    # # Allow spreadsheets to be cached
	# $self->res->headers->header(Expires => 'Tue, 15 Jan 2018 21:47:38 GMT;');    
    
# };
  

# add helper methods for interacting with database
helper db => sub { $dbh };



# helper list_stacks => sub {
  # my $self = shift;
  # my $sth = eval { $self->db->prepare("SELECT id, name_ru, name_be, lat, lon FROM beltop") } || return undef;
  # $sth->execute;
  # my $ref = $sth->fetchall_hashref('id');
  # return $ref;
# };




any '/q' => sub {
  my $c = shift;
  $c->reply->static('indexAll.html');
};

any '/' => sub {
  my $c = shift;
  $c->reply->static('index.html');
};

# get '/' => {template => 'hello', title => 'Hello', gzip => 1};

# any '/list.js' => sub {
	# my $self = shift;
	# my $ref = $self->list_stacks;
    # $self->render(json => $ref );
# };

any '/grd.js' => sub {
	my $self = shift;
    $self->render(json => $ci_ref );
};

any '/ren.js' => sub {
	my $self = shift;
    $self->render(json => $ren_ref );
};

any '/topct.js' => sub {
	my $self = shift;
    $self->render(json => $top_ref);
};

any '/districts.js' => sub {
	my $self = shift;
	# CAST (substr (osm_id_rel, 2) as decimal) as osm_id
	# SELECT beladmdiv.place_id, beladmdiv.name_be, beltop.name_be from  beladmdiv join beltop on beladmdiv.place_id = beltop.id where beladmdiv.adm_lvl = 2
	
	my $sth = eval { $dbh->prepare("SELECT beltop.name_be as capital_be, beladmdiv.id, beladmdiv.name_be, beladmdiv.name_ru, beladmdiv.pop, beladmdiv.nat_lang_pc_be, beladmdiv.nat_lang_pc_ru, beladmdiv.home_lang_pc_be, beladmdiv.home_lang_pc_ru FROM beladmdiv join beltop on beladmdiv.place_id = beltop.id WHERE adm_lvl =2 and is_area = 1") } || return undef;
	$sth->execute;
	my $ref_districts  = $sth->fetchall_hashref('id');
    $self->render(json => $ref_districts );
};



any '/data.js' => sub {
	
	my $self = shift;
	my $p = $self->req->params->to_hash;
	
	my @resp;
	my $r = $p->{r};
	
	
	
	
	if (length($r)){
		# say($r);
		my $a=$r;
		
		my $be = $a =~ s/\@//;
		my $lang = $be ? 'name_be' : 'name_ru';
		$a =~ s/\!/\\b/;
		my @rxs= split('#', $a);
		# say ($#rxs);
		# if ($#rxs) {
			# # say ("multi");
		# } else {
			# # say ("single");
			# $a = index($r,'$') ==-1 ? "\\b$r" : $r;
		# }
		
		foreach my $item (@$ref){
			my $ru = $item->{$lang};
			unless ($#rxs){
				push(@resp, $item) if ($ru =~ m/$a/i);
			} else {
				foreach my $rx(@rxs){
					if ($ru =~ m/$rx/i){
						my %i2push = %{$item};
						$i2push{group} = $rx;
						push @resp, \%i2push;
					}
				}
			}
		}
	}
    $self->render(json => \@resp);
	
	# {"RecNo":"97","name_ru":"Новосёлки","lat":"53.01272","lon":"26.89093"},{"RecNo":"98","name_ru":"Новосёлки","lat":"52.9294406","lon":"27.1032459"},
    # $self->render(json => {"req" => $r});
    # $self->render(json => [{"req" => $r}, {be=>"yes"}]);
};





 app->start;

__DATA__

@@ foo.html.ep

% layout 'default';
% title 'Foo';