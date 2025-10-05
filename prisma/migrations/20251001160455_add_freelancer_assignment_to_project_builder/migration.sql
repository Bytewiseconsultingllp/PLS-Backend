-- CreateTable
CREATE TABLE "public"."_InterestedProjectBuilderFreelancers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InterestedProjectBuilderFreelancers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_SelectedProjectBuilderFreelancers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SelectedProjectBuilderFreelancers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InterestedProjectBuilderFreelancers_B_index" ON "public"."_InterestedProjectBuilderFreelancers"("B");

-- CreateIndex
CREATE INDEX "_SelectedProjectBuilderFreelancers_B_index" ON "public"."_SelectedProjectBuilderFreelancers"("B");

-- AddForeignKey
ALTER TABLE "public"."_InterestedProjectBuilderFreelancers" ADD CONSTRAINT "_InterestedProjectBuilderFreelancers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ProjectBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InterestedProjectBuilderFreelancers" ADD CONSTRAINT "_InterestedProjectBuilderFreelancers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SelectedProjectBuilderFreelancers" ADD CONSTRAINT "_SelectedProjectBuilderFreelancers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ProjectBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SelectedProjectBuilderFreelancers" ADD CONSTRAINT "_SelectedProjectBuilderFreelancers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
