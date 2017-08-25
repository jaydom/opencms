CREATE TABLE "sys_squenceid" (

"id" uuid NOT NULL DEFAULT uuid_generate_v4(),

"name" CHARACTER VARYING(255) NULL,

"sequence_date" CHARACTER VARYING(255) NULL,

"sequence_id" integer NULL,

"create_date" TIMESTAMP NULL,

"update_date" TIMESTAMP NULL,

PRIMARY KEY ("id") 

);


CREATE FUNCTION "public"."sid_generate_v1"(table_name varchar)
  RETURNS "pg_catalog"."_cid" AS $BODY$DECLARE
  Seq_id   integer;
  Seq_date varchar;
  Seq_curdate varchar;
  curs1  refcursor; 
BEGIN
	--Routine body goes here...
  Seq_curdate := TO_CHAR(CURRENT_DATE,'yyyymmdd');
  OPEN curs1 for SELECT sequence_id,sequence_date from sys_squenceid WHERE name=table_name and sequence_date=Seq_curdate;
  FETCH curs1 into Seq_id,Seq_date; 
  IF Seq_date IS NULL THEN
    Seq_id := 1;
    Seq_date := Seq_curdate;
		INSERT INTO sys_squenceid(name,sequence_date,sequence_id,create_date) VALUES(table_name,Seq_curdate,1,CURRENT_DATE);
  ELSEIF Seq_date != Seq_curdate THEN
    Seq_id := 1;
    Seq_date := Seq_curdate;
    update sys_squenceid set sequence_id=Seq_id,sequence_date=Seq_curdate,update_date=CURRENT_DATE where name=table_name;
  ELSE
    Seq_id := Seq_id+1;
    update sys_squenceid set sequence_id=Seq_id,update_date=CURRENT_DATE where name=table_name;
  END IF;
	RETURN CONCAT(Seq_date,TO_CHAR(Seq_id,'FM009'));
END$BODY$
  LANGUAGE 'plpgsql' VOLATILE COST 100
;

ALTER FUNCTION "public"."sid_generate_v1"(table_name varchar) OWNER TO "postgres";