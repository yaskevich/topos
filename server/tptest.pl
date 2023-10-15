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

my $dbh = DBI->connect("dbi:SQLite:top.db","","", {sqlite_unicode => 1}) or die "Could not connect";

# my $sth = eval { $dbh->prepare("SELECT id, name_ru, name_be, lat, lon FROM beltop where name_ru GLOB '[Бб]арс*' ") } || return undef;
# my $sth = eval { $dbh->prepare("SELECT id, name_ru, name_be, lat, lon FROM beltop") } || return undef;
# $sth->execute;
# my $ref = $sth->fetchall_arrayref;
my $ref = $dbh->selectall_arrayref("SELECT id, name_ru, name_be, lat, lon FROM beltop", { Slice => {} }  );

# print Dumpers($ref);

sub Dumpers {
    my $dump = Dumper(@_);
    $dump  =~ s/(\\x\{[\da-fA-F]+\})/eval "qq{$1}"/eg;
    $dump;
}

foreach my $item (@$ref){
	my $ru = $item->{name_ru};
	
	 if ($ru =~ m/барс.*/i){
		say $ru;
		# my $new  = {$item};
		# print Dumpers($new);
	}
	
}


# say Dumper($ref);