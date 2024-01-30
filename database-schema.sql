-- Created with https://drawsql.app/trailstories/diagrams/bike-parts-tracker#


CREATE TABLE "user"(
    "id" TEXT NOT NULL DEFAULT 'gen_random_uuid()',
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL DEFAULT 'now()',
        "last_seen_at" TIMESTAMP(0)
    WITH
        TIME zone NULL,
        "updated_at" TIMESTAMP(0)
    WITH
        TIME zone NULL,
        "strava_user" TEXT NULL,
        "currency_unit" TEXT NOT NULL,
        "weight_unit" TEXT NOT NULL,
        "distance_unit" TEXT NOT NULL
);
ALTER TABLE
    "user" ADD PRIMARY KEY("id");
CREATE TABLE "category"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "name" TEXT NOT NULL
);
ALTER TABLE
    "category" ADD PRIMARY KEY("id");
CREATE TABLE "bike"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "created_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL DEFAULT 'now()',
        "updated_at" TIMESTAMP(0)
    WITH
        TIME zone NULL,
        "name" TEXT NOT NULL,
        "ebike" BOOLEAN NOT NULL,
        "user_id" TEXT NOT NULL,
        "discipline_id" UUID NOT NULL,
        "category_id" UUID NOT NULL,
        "strava_bike" TEXT NULL
);
ALTER TABLE
    "bike" ADD PRIMARY KEY("id");
CREATE TABLE "sell_status"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "name" TEXT NOT NULL
);
ALTER TABLE
    "sell_status" ADD PRIMARY KEY("id");
CREATE TABLE "installation"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "part_id" UUID NOT NULL,
    "bike_id" UUID NOT NULL,
    "installed_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL,
        "uninstalled_at" TIMESTAMP(0)
    WITH
        TIME zone NULL
);
ALTER TABLE
    "installation" ADD PRIMARY KEY("id");
CREATE TABLE "part"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "created_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL DEFAULT 'now()',
        "updated_at" TIMESTAMP(0)
    WITH
        TIME zone NULL,
        "manufacturer_id" UUID NOT NULL,
        "buy_price" DOUBLE PRECISION NULL,
        "sell_price" DOUBLE PRECISION NULL,
        "name" TEXT NOT NULL,
        "weight" INTEGER NOT NULL,
        "type_id" UUID NOT NULL,
        "purchase_date" TIMESTAMP(0)
    WITH
        TIME zone NOT NULL,
        "receipt" TEXT NULL,
        "secondhand" BOOLEAN NOT NULL,
        "shop_url" TEXT NULL,
        "sell_status_id" UUID NOT NULL,
        "user_id" TEXT NOT NULL,
        "model_year" INTEGER NOT NULL
);
ALTER TABLE
    "part" ADD PRIMARY KEY("id");
CREATE TABLE "weight_unit"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "unit" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "weight_unit" ADD PRIMARY KEY("id");
CREATE TABLE "manufacturer"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "created_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL DEFAULT 'now()',
        "updated_at" TIMESTAMP(0)
    WITH
        TIME zone NULL,
        "name" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "url" TEXT NULL
);
ALTER TABLE
    "manufacturer" ADD PRIMARY KEY("id");
CREATE TABLE "discipline"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL
);
ALTER TABLE
    "discipline" ADD PRIMARY KEY("id");
CREATE TABLE "distance_unit"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "unit" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "distance_unit" ADD PRIMARY KEY("id");
CREATE TABLE "parts_type"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "created_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL DEFAULT 'now()',
        "updated_at" TIMESTAMP(0)
    WITH
        TIME zone NULL,
        "name" TEXT NOT NULL,
        "max_amount" INTEGER NULL,
        "service_interval" INTEGER NULL
);
ALTER TABLE
    "parts_type" ADD PRIMARY KEY("id");
CREATE TABLE "currency_unit"(
    "id" UUID NOT NULL DEFAULT 'gen_random_uuid()',
    "unit" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "currency_unit" ADD PRIMARY KEY("id");
ALTER TABLE
    "part" ADD CONSTRAINT "part_sell_status_id_foreign" FOREIGN KEY("sell_status_id") REFERENCES "sell_status"("id");
ALTER TABLE
    "bike" ADD CONSTRAINT "bike_discipline_id_foreign" FOREIGN KEY("discipline_id") REFERENCES "discipline"("id");
ALTER TABLE
    "part" ADD CONSTRAINT "part_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "user"("id");
ALTER TABLE
    "part" ADD CONSTRAINT "part_type_id_foreign" FOREIGN KEY("type_id") REFERENCES "parts_type"("id");
ALTER TABLE
    "user" ADD CONSTRAINT "user_weight_unit_foreign" FOREIGN KEY("weight_unit") REFERENCES "weight_unit"("id");
ALTER TABLE
    "bike" ADD CONSTRAINT "bike_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "user"("id");
ALTER TABLE
    "part" ADD CONSTRAINT "part_manufacturer_id_foreign" FOREIGN KEY("manufacturer_id") REFERENCES "manufacturer"("id");
ALTER TABLE
    "bike" ADD CONSTRAINT "bike_category_id_foreign" FOREIGN KEY("category_id") REFERENCES "category"("id");
ALTER TABLE
    "installation" ADD CONSTRAINT "installation_part_id_foreign" FOREIGN KEY("part_id") REFERENCES "part"("id");
ALTER TABLE
    "user" ADD CONSTRAINT "user_distance_unit_foreign" FOREIGN KEY("distance_unit") REFERENCES "distance_unit"("id");
ALTER TABLE
    "installation" ADD CONSTRAINT "installation_bike_id_foreign" FOREIGN KEY("bike_id") REFERENCES "bike"("id");
ALTER TABLE
    "user" ADD CONSTRAINT "user_currency_unit_foreign" FOREIGN KEY("currency_unit") REFERENCES "currency_unit"("id");