-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Event_title_idx" ON "Event"("title");

-- CreateIndex
CREATE INDEX "Event_status_startAt_idx" ON "Event"("status", "startAt");

-- CreateIndex
CREATE INDEX "Event_startAt_endAt_idx" ON "Event"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "Event_status_closeRegisterAt_idx" ON "Event"("status", "closeRegisterAt");

-- CreateIndex
CREATE INDEX "EventAttendee_eventId_idx" ON "EventAttendee"("eventId");

-- CreateIndex
CREATE INDEX "EventAttendee_eventId_status_idx" ON "EventAttendee"("eventId", "status");

-- CreateIndex
CREATE INDEX "EventCategory_eventId_idx" ON "EventCategory"("eventId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
