import { supabaseAdmin } from "./integrations/supabase/client.server";

async function run() {
  console.log("Starting deletion of reservations...");
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("Error deleting reservations:", error);
  } else {
    console.log("Successfully deleted all reservations.");
  }
  
  console.log("Starting deletion of complaints...");
  const { error: cError } = await supabaseAdmin
    .from("complaints")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (cError) {
    console.error("Error deleting complaints:", cError);
  } else {
    console.log("Successfully deleted all complaints.");
  }
}

run();
