import test from "node:test";
import assert from "node:assert/strict";

import {
  getAdminMatches,
  getAdminMatchesPageState,
  runMatchCampaignToCreator,
} from "../../src/lib/platform/admin-matches";

test("getAdminMatches enforces admin-only access through the shared role guard", async () => {
  const requireRoleCalls: Array<{ locale: string; expectedRole: string }> = [];

  const data = await getAdminMatches("en", {
    async requireRole(locale, expectedRole) {
      requireRoleCalls.push({ locale, expectedRole });

      return {
        profile: {
          id: "admin-profile",
          role: "admin",
          email: "admin@example.com",
          full_name: "Admin User",
        },
        supabase: {
          from(table: string) {
            return {
              select() {
                return {
                  async order() {
                    if (table === "campaigns") {
                      return {
                        data: [
                          {
                            id: "campaign-1",
                            title: "Spring launch",
                            status: "live",
                            product_type: "Supplements",
                            creator_slots: 3,
                            created_at: "2026-03-23T09:30:00.000Z",
                            brands: {
                              company_name: "Acme",
                            },
                          },
                        ],
                        error: null,
                      };
                    }

                    return {
                      data: [
                        {
                          id: "creator-1",
                          email: "creator@example.com",
                          display_name: "Kasia",
                          status: "active",
                          application_notes: "Strong fit for wellness briefs",
                          updated_at: "2026-03-23T09:35:00.000Z",
                        },
                      ],
                      error: null,
                    };
                  },
                };
              },
            };
          },
        },
      };
    },
  });

  assert.deepEqual(requireRoleCalls, [{ locale: "en", expectedRole: "admin" }]);
  assert.equal(data.profile.role, "admin");
  assert.equal(data.campaigns[0]?.brandName, "Acme");
  assert.equal(data.creators[0]?.displayName, "Kasia");
});

test("runMatchCampaignToCreator calls the existing RPC and revalidates creator dashboards", async () => {
  const rpcCalls: Array<{ fn: string; args: Record<string, string> }> = [];
  const revalidatedPaths: string[] = [];

  const result = await runMatchCampaignToCreator(
    {
      locale: "pl",
      campaignId: "campaign-1",
      creatorId: "creator-9",
    },
    {
      async rpc(fn, args) {
        rpcCalls.push({
          fn,
          args: args as Record<string, string>,
        });

        return { error: null };
      },
      revalidatePath(path) {
        revalidatedPaths.push(path);
      },
    },
  );

  assert.deepEqual(rpcCalls, [
    {
      fn: "match_campaign_to_creator",
      args: {
        target_campaign_id: "campaign-1",
        target_creator_id: "creator-9",
      },
    },
  ]);
  assert.deepEqual(revalidatedPaths, [
    "/pl/admin/matches",
    "/en/dashboard/creator",
    "/pl/dashboard/creator",
  ]);
  assert.equal(
    result.redirectPath,
    "/pl/admin/matches?matched=1&campaignId=campaign-1&creatorId=creator-9",
  );
});

test("getAdminMatchesPageState preserves success and error feedback on the matches page", () => {
  assert.deepEqual(
    getAdminMatchesPageState({
      matched: "1",
      campaignId: "campaign-1",
      creatorId: "creator-9",
    }),
    {
      error: null,
      selectedCampaignId: "campaign-1",
      selectedCreatorId: "creator-9",
      success: {
        campaignId: "campaign-1",
        creatorId: "creator-9",
      },
    },
  );

  assert.deepEqual(
    getAdminMatchesPageState({
      error: encodeURIComponent("Only admins can match campaigns"),
      campaignId: "campaign-1",
      creatorId: "creator-9",
    }),
    {
      error: "Only admins can match campaigns",
      selectedCampaignId: "campaign-1",
      selectedCreatorId: "creator-9",
      success: null,
    },
  );
});
