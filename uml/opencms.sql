CREATE TABLE "t_player" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"name" CHARACTER VARYING(255) NOT NULL,
"sex" CHARACTER VARYING(255) NOT NULL,
"telno" CHARACTER VARYING NOT NULL,
"idcard" CHARACTER VARYING NOT NULL,
"club" CHARACTER VARYING(255) NULL,
"club_id" CHARACTER VARYING NULL,
"create_date" DATE NULL,
"update_date" DATE NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_admin" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"name" CHARACTER VARYING(255) NULL,
"password" CHARACTER VARYING(255) NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
"email" CHARACTER VARYING NULL,
"role_name" CHARACTER VARYING NULL,
"role_id" CHARACTER VARYING NULL,
"sort_id" SERIAL NOT NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_video" (
"id" INTEGER NOT NULL,
"url" CHARACTER VARYING(255) NULL,
"name" CHARACTER VARYING(255) NULL,
"comment" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_notice" (
);

CREATE TABLE "t_role" (
);

CREATE TABLE "t_auth" (
);

CREATE TABLE "t_right" (
);

CREATE TABLE "t_role_right" (
"id" INTEGER NOT NULL,
"role_id" INTEGER NULL,
"right_id" INTEGER NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "user" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"name" CHARACTER VARYING(255) NULL,
"password" CHARACTER VARYING(255) NULL,
"sort_id" SERIAL  NOT NULL,
"create_date" DATE NULL,
"update_date" DATE NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_tables" (
"id" INTEGER NOT NULL,
"name" CHARACTER VARYING(255) NULL,
"type" CHARACTER VARYING(255) NULL,
"input_type" CHARACTER VARYING(255) NULL,
"format" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_certificate" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"player_id" uuid NULL,
"exam_type" CHARACTER VARYING(255) NULL,
"exam_level" CHARACTER VARYING(255) NULL,
"exam_address" CHARACTER VARYING(255) NULL,
"exam_time" DATE NULL,
"cert_id" INTEGER NULL,
"cert_time" DATE NULL,
"club" CHARACTER VARYING(255) NULL,
"cert_image" CHARACTER VARYING(255) NULL,
"cert_image_md5" CHARACTER VARYING(255) NULL,
"exam_area" CHARACTER VARYING(255) NULL,
"sex" CHARACTER VARYING(255) NULL,
"tel" CHARACTER VARYING(255) NULL,
"name" CHARACTER VARYING NULL,
"player_name" CHARACTER VARYING(255) NULL,
"idcard" CHARACTER VARYING(255) NULL,
"sort_id" SERIAL NOT NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_apply" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"sort_id" serial NOT NULL,
"name" CHARACTER VARYING(255) NULL,
"sex" CHARACTER VARYING(255) NULL,
"nation" CHARACTER VARYING(255) NULL,
"birth_date" CHARACTER VARYING NULL,
"idcard" CHARACTER VARYING(255) NULL,
"telno" CHARACTER VARYING NULL,
"email" CHARACTER VARYING(255) NULL,
"city" CHARACTER VARYING(255) NULL,
"address" CHARACTER VARYING(255) NULL,
"club" CHARACTER VARYING(255) NULL,
"leader" CHARACTER VARYING(255) NULL,
"leader_id" CHARACTER VARYING NULL,
"club_id" CHARACTER VARYING NULL,
"coach" CHARACTER VARYING(255) NULL,
"coach_id" CHARACTER VARYING NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
"exam_type" CHARACTER VARYING(255) NULL,
"exam_level" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_coach" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"name" CHARACTER VARYING(255) NULL,
"sort_id" serial NOT NULL,
"sex" CHARACTER VARYING(255) NULL,
"telno" CHARACTER VARYING NULL,
"email" CHARACTER VARYING(255) NULL,
"club" CHARACTER VARYING(255) NULL,
"club_id" CHARACTER VARYING NULL,
"cert_id" CHARACTER VARYING NULL,
"cert_type" CHARACTER VARYING(255) NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_club" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"sort_id" SERIAL NOT NULL,
"name" CHARACTER VARYING(255) NULL,
"address" CHARACTER VARYING(255) NULL,
"contacter" CHARACTER VARYING(255) NULL,
"contacter_email" CHARACTER VARYING(255) NULL,
"contacter_telno" CHARACTER VARYING NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_leader" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"name" CHARACTER VARYING(255) NULL,
"sort_id" serial NOT NULL,
"sex" CHARACTER VARYING(255) NULL,
"telno" CHARACTER VARYING NULL,
"email" CHARACTER VARYING(255) NULL,
"club" CHARACTER VARYING(255) NULL,
"club_id" CHARACTER VARYING NULL,
"cert_id" CHARACTER VARYING NULL,
"cert_type" CHARACTER VARYING(255) NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "t_user" (
"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
"name" CHARACTER VARYING(255) NULL,
"password" CHARACTER VARYING(255) NULL,
"create_date" TIMESTAMP NULL,
"update_date" TIMESTAMP NULL,
"email" CHARACTER VARYING NULL,
"role_name" CHARACTER VARYING NULL,
"role_id" CHARACTER VARYING NULL,
"sort_id" SERIAL NOT NULL,
PRIMARY KEY ("id") 
);
