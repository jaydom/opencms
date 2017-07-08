CREATE TABLE "T_player" (
"id" INTEGER NOT NULL,
"name" CHARACTER VARYING(255) NOT NULL,
"sex" CHARACTER VARYING(255) NOT NULL,
"phone_no" INTEGER NOT NULL,
"identity_no" INTEGER NOT NULL,
"school" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "T_admin" (
"id" INTEGER NOT NULL,
"name" CHARACTER VARYING(255) NULL,
"password" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "T_video" (
"id" INTEGER NOT NULL,
"url" CHARACTER VARYING(255) NULL,
"name" CHARACTER VARYING(255) NULL,
"comment" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "T_notice" (
);

CREATE TABLE "T_role" (
);

CREATE TABLE "T_coach" (
"id" INTEGER NOT NULL,
"name" CHARACTER VARYING(255) NOT NULL,
"sex" CHARACTER VARYING(255) NOT NULL,
"phone_no" INTEGER NOT NULL,
"identity_no" INTEGER NOT NULL,
"school" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "T_auth" (
);

CREATE TABLE "T_right" (
);

CREATE TABLE "T_role_right" (
"id" INTEGER NOT NULL,
"role_id" INTEGER NULL,
"right_id" INTEGER NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "user" (
"id" INTEGER NOT NULL,
"name" CHARACTER VARYING(255) NULL,
"password" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "T_tables" (
"id" INTEGER NOT NULL,
"name" CHARACTER VARYING(255) NULL,
"type" CHARACTER VARYING(255) NULL,
"input_type" CHARACTER VARYING(255) NULL,
"format" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

CREATE TABLE "T_certificate" (
"id" INTEGER NOT NULL,
"player_id" INTEGER NULL,
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
"player_name" CHARACTER VARYING(255) NULL,
PRIMARY KEY ("id") 
);

