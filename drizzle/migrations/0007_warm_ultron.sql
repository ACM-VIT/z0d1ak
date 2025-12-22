CREATE INDEX "comments_post_id_created_at_idx" ON "comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "competition_participants_competition_id_created_at_idx" ON "competition_participants" USING btree ("competition_id","created_at");--> statement-breakpoint
CREATE INDEX "likes_post_id_idx" ON "likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_tags_tag_id_idx" ON "post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "posts_author_id_created_at_idx" ON "posts" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "posts_is_draft_created_at_idx" ON "posts" USING btree ("is_draft","created_at");--> statement-breakpoint
CREATE INDEX "posts_category_id_is_draft_created_at_idx" ON "posts" USING btree ("category_id","is_draft","created_at");--> statement-breakpoint
CREATE INDEX "posts_competition_id_is_draft_created_at_idx" ON "posts" USING btree ("competition_id","is_draft","created_at");