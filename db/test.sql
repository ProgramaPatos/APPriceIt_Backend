call create_product(n=>'bonyurt',description=>'es un buen producto xd');
--select * from product;
call create_user(n=>'pepito',pass=>'qwerty',state=>true);
--select * from appuser;
call create_price(val=>12000,id_user=>1);
--select * from price;
call create_role(n=>'admin');
--select * from role;
call assign_role(id_role=>1,id_user=>1);
--select * from appuserrole;
call assign_product_tag(id_product=>1,id_tag=>1);
--select * from producttag;
call create_price_review(score=>2,comment=>'taba caro',id_user=>1,id_price=>1);
--select * from pricereview;
call assign_product_to_store(availability=>10,id_product=>1,id_store=>1,id_price=>1);
--select * from productatstore;