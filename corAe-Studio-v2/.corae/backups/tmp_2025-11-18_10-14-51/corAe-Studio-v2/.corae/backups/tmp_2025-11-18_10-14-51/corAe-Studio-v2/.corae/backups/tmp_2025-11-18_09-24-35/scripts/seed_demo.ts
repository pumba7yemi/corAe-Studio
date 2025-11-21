import { prisma } from "@/lib/prisma";
async function main(){
  const vendor = await prisma.party.upsert({
    where:{ id:"ven_demo" }, update:{},
    create:{ id:"ven_demo", kind:"Vendor", name:"Demo Vendor" }
  });
  const client = await prisma.party.upsert({
    where:{ id:"cli_demo" }, update:{},
    create:{ id:"cli_demo", kind:"Client", name:"Demo Client" }
  });
  console.log({ vendor: vendor.name, client: client.name });
}
main().finally(()=>process.exit(0));