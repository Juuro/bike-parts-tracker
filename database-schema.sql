-- Created with https://drawsql.app/trailstories/diagrams/bike-parts-tracker#


CREATE TABLE "bikepartstracker"."bike"(
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "updated_at" TIMESTAMP(0) WITH TIME zone NULL,
    "name" TEXT NOT NULL,
    "ebike" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,
    "discipline_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "strava_bike" TEXT NULL
);
ALTER TABLE
    "bikepartstracker"."bike" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."part"(
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "updated_at" TIMESTAMP(0) WITH TIME zone NULL,
    "manufacturer_id" UUID NOT NULL,
    "buy_price" DOUBLE PRECISION NULL,
    "sell_price" DOUBLE PRECISION NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "type_id" UUID NOT NULL,
    "purchase_date" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "receipt" TEXT NULL,
    "secondhand" BOOLEAN NOT NULL,
    "shop_url" TEXT NULL,
    "user_id" TEXT NOT NULL,
    "sell_status_id" UUID NOT NULL,
    "model_year" INTEGER NOT NULL
);
ALTER TABLE
    "bikepartstracker"."part" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."parts_type"(
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "updated_at" TIMESTAMP(0) WITH TIME zone NULL,
    "name" TEXT NOT NULL,
    "max_amount" INTEGER NULL,
    "service_interval" INTEGER NULL
);
ALTER TABLE
    "bikepartstracker"."parts_type" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."manufacturer"(
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "updated_at" TIMESTAMP(0) WITH TIME zone NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "url" TEXT NULL
);
ALTER TABLE
    "bikepartstracker"."manufacturer" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."installation"(
    "id" UUID NOT NULL,
    "part_id" UUID NOT NULL,
    "bike_id" UUID NOT NULL,
    "installed_at" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "uninstalled_at" TIMESTAMP(0) WITH TIME zone NULL
);
ALTER TABLE
    "bikepartstracker"."installation" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."discipline"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL
);
ALTER TABLE
    "bikepartstracker"."discipline" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."category"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL
);
ALTER TABLE
    "bikepartstracker"."category" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."user"(
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) WITH TIME zone NOT NULL,
    "last_seen_at" TIMESTAMP(0) WITH TIME zone NULL,
    "updated_at" TIMESTAMP(0) WITH TIME zone NULL,
    "strava_user" TEXT NULL
);
ALTER TABLE
    "bikepartstracker"."user" ADD PRIMARY KEY("id");
CREATE TABLE "bikepartstracker"."sell_status"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL
);
ALTER TABLE
    "bikepartstracker"."sell_status" ADD PRIMARY KEY("id");
ALTER TABLE
    "bikepartstracker"."bike" ADD CONSTRAINT "bikepartstracker_bike_discipline_id_foreign" FOREIGN KEY("discipline_id") REFERENCES "bikepartstracker"."discipline"("id");
ALTER TABLE
    "bikepartstracker"."bike" ADD CONSTRAINT "bikepartstracker_bike_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "bikepartstracker"."user"("id");
ALTER TABLE
    "bikepartstracker"."part" ADD CONSTRAINT "bikepartstracker_part_manufacturer_id_foreign" FOREIGN KEY("manufacturer_id") REFERENCES "bikepartstracker"."manufacturer"("id");
ALTER TABLE
    "bikepartstracker"."part" ADD CONSTRAINT "bikepartstracker_part_type_id_foreign" FOREIGN KEY("type_id") REFERENCES "bikepartstracker"."parts_type"("id");
ALTER TABLE
    "bikepartstracker"."part" ADD CONSTRAINT "bikepartstracker_part_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "bikepartstracker"."user"("id");
ALTER TABLE
    "bikepartstracker"."part" ADD CONSTRAINT "bikepartstracker_part_sell_status_id_foreign" FOREIGN KEY("sell_status_id") REFERENCES "bikepartstracker"."sell_status"("id");
ALTER TABLE
    "bikepartstracker"."installation" ADD CONSTRAINT "bikepartstracker_installation_part_id_foreign" FOREIGN KEY("part_id") REFERENCES "bikepartstracker"."part"("id");
ALTER TABLE
    "bikepartstracker"."installation" ADD CONSTRAINT "bikepartstracker_installation_bike_id_foreign" FOREIGN KEY("bike_id") REFERENCES "bikepartstracker"."bike"("id");
ALTER TABLE
    "bikepartstracker"."bike" ADD CONSTRAINT "bikepartstracker_bike_category_id_foreign" FOREIGN KEY("category_id") REFERENCES "bikepartstracker"."category"("id");