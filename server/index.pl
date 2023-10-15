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

app->secrets('adsfsdfas9qu4iganz');
# app->defaults(gzip => 1);

# my $dbh = DBI->connect("dbi:SQLite:top.db","","", {sqlite_unicode => 1}) or die "Could not connect";
my $dbh = DBI->connect("dbi:SQLite:/var/www/toptopos/top.db","","", {sqlite_unicode => 1,  AutoCommit => 0}) or die "Could not connect";

my $ref = $dbh->selectall_arrayref("SELECT id, name_ru, name_be, lat, lon, county FROM beltop where lat is not null", { Slice => {} }  );

# my $ref_districts = $dbh->selectall_arrayref("SELECT id, name_be, name_ru, CAST (substr (osm_id_rel, 2) as decimal) as osm_id, pop, nat_lang_pc_be, nat_lang_pc_ru, home_lang_pc_be, home_lang_pc_ru FROM beladmdiv WHERE adm_lvl =2 and is_area = 1", { Slice => {} }  );



# my $ci_ref = $dbh->selectall_arrayref("SELECT substr(belcities.wiki_coat_img_path, -4, 4) as ext, belcities.place_id, belcities.name_be, belcities.est_date, belcities.magd_date, belcities.pop, beltop.lat, beltop.lon, beltop.name_ru FROM belcities INNER JOIN beltop ON belcities.place_id = beltop.id", { Slice => {} }  );
my $ci_ref = $dbh->selectall_arrayref("
SELECT substr(belcities.wiki_coat_img_path, -4, 4) as ext, belren.names_pre_be, belcities.place_id, belcities.name_be, belcities.est_date, belcities.magd_date, belcities.pop, beltop.lat, beltop.lon, beltop.name_ru 
FROM belcities 
INNER JOIN beltop ON belcities.place_id = beltop.id

left JOIN belren ON belcities.place_id = belren.place_id", { Slice => {} }  );


my $ren_ref = $dbh->selectall_arrayref("select id, lat, lon, ren_date, name_be, names_pre_be from belren where lon > 0 and ren_date > 0", { Slice => {} }  );


under sub {
        shift->stash(now => join('.', gettimeofday()));
};

hook before_dispatch => sub {
   my $self = shift;
   # notice: url must be fully-qualified or absolute, ending in '/' matters.
   $self->req->url->base(Mojo::URL->new(q{http://top.dev/}));
};  
  
 hook after_dispatch => sub {
    my $self = shift;

    # Was the response dynamic?
    return if $self->res->headers->header('Expires');

    # Allow spreadsheets to be cached
	$self->res->headers->header(Expires => 'Tue, 15 Jan 2018 21:47:38 GMT;');    
    
 };
  

# add helper methods for interacting with database
helper db => sub { $dbh };



# helper list_stacks => sub {
  # my $self = shift;
  # my $sth = eval { $self->db->prepare("SELECT id, name_ru, name_be, lat, lon FROM beltop") } || return undef;
  # $sth->execute;
  # my $ref = $sth->fetchall_hashref('id');
  # return $ref;
# };




any '/' => sub {
  my $c = shift;
  $c->reply->static('index.html');
};

any '/list.js' => sub {
	my $self = shift;
	my $ref = $self->list_stacks;
    $self->render(json => $ref );
};

any '/grd.js' => sub {
	my $self = shift;
    $self->render(json => $ci_ref );
};

any '/ren.js' => sub {
	my $self = shift;
    $self->render(json => $ren_ref );
};

any '/districts.js' => sub {
	my $self = shift;
	
	my $sth = eval { $dbh->prepare("SELECT id, name_be, name_ru, CAST (substr (osm_id_rel, 2) as decimal) as osm_id, pop, nat_lang_pc_be, nat_lang_pc_ru, home_lang_pc_be, home_lang_pc_ru FROM beladmdiv WHERE adm_lvl =2 and is_area = 1") } || return undef;
	$sth->execute;
	my $ref_districts  = $sth->fetchall_hashref('osm_id');
    $self->render(json => $ref_districts );
};



any '/data.js' => sub {
	
	my $self = shift;
	my $p = $self->req->params->to_hash;
	
	my @resp;
	
	my $r = $p->{r};
	
	
	foreach my $item (@$ref){
	my $ru = $item->{name_ru};
	
	# ;
	my $a = index($r, '$') ==-1 ? "\\b$r" : $r.'$';
	 if ($ru =~ m/$a/i){
		push @resp, $item;
		# print Dumpers(@$item);
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