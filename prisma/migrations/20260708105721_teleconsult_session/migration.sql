-- CreateEnum
CREATE TYPE "teleconsult_status" AS ENUM ('SCHEDULED', 'ONGOING', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "teleconsult_sessions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "room_code" TEXT NOT NULL,
    "status" "teleconsult_status" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "join_url" TEXT,
    "note" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teleconsult_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teleconsult_sessions_appointment_id_key" ON "teleconsult_sessions"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "teleconsult_sessions_room_code_key" ON "teleconsult_sessions"("room_code");

-- CreateIndex
CREATE INDEX "teleconsult_sessions_tenant_id_scheduled_at_idx" ON "teleconsult_sessions"("tenant_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "teleconsult_sessions_doctor_id_scheduled_at_idx" ON "teleconsult_sessions"("doctor_id", "scheduled_at");

-- AddForeignKey
ALTER TABLE "teleconsult_sessions" ADD CONSTRAINT "teleconsult_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teleconsult_sessions" ADD CONSTRAINT "teleconsult_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teleconsult_sessions" ADD CONSTRAINT "teleconsult_sessions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teleconsult_sessions" ADD CONSTRAINT "teleconsult_sessions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
