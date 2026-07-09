-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "purpose" "notification_type" NOT NULL,
    "body" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_templates_tenant_id_purpose_key" ON "whatsapp_templates"("tenant_id", "purpose");

-- AddForeignKey
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
