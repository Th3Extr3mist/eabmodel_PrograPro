-- CreateTable
CREATE TABLE "appuser" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "age" INTEGER,
    "user_password" VARCHAR(255) NOT NULL,
    "user_type" VARCHAR(50),
    "preference_history" TEXT,
    "salt" VARCHAR(64),
    "hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "appuser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "client" (
    "client_id" UUID NOT NULL,
    "preference_history" TEXT,

    CONSTRAINT "client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "eventinfo" (
    "event_id" SERIAL NOT NULL,
    "organizer_id" INTEGER NOT NULL,
    "event_name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "availability" INTEGER,

    CONSTRAINT "eventinfo_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "eventlocation" (
    "location_id" SERIAL NOT NULL,
    "address" VARCHAR(255) NOT NULL,

    CONSTRAINT "eventlocation_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "organizer" (
    "organizer_id" SERIAL NOT NULL,
    "organizer_name" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(100),
    "organizer_type" VARCHAR(50),

    CONSTRAINT "organizer_pkey" PRIMARY KEY ("organizer_id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "reservation_id" SERIAL NOT NULL,
    "user_id" UUID,
    "event_id" INTEGER,
    "ticket_quantity" INTEGER,
    "reservation_date" DATE,
    "status" VARCHAR(50),

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateTable
CREATE TABLE "weather" (
    "weather_id" SERIAL NOT NULL,
    "location_id" INTEGER,
    "temperature" DECIMAL(5,2),
    "weather_condition" VARCHAR(50),
    "weather_date" DATE,
    "weather_time" TIME(6),

    CONSTRAINT "weather_pkey" PRIMARY KEY ("weather_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appuser_email_key" ON "appuser"("email");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "appuser"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventinfo" ADD CONSTRAINT "eventinfo_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "eventlocation"("location_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventinfo" ADD CONSTRAINT "eventinfo_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizer"("organizer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "eventinfo"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "appuser"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weather" ADD CONSTRAINT "weather_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "eventlocation"("location_id") ON DELETE CASCADE ON UPDATE NO ACTION;
