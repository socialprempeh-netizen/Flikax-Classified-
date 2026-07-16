export type District = {
  name: string;
  slug: string;
};

export type Region = {
  name: string;
  slug: string;
  districts: District[];
};

export const GHANA_REGIONS: Region[] = [
  {
    name: "Greater Accra",
    slug: "greater-accra",
    districts: [
      { name: "Accra Metropolitan", slug: "accra-metropolitan" },
      { name: "East Legon", slug: "east-legon" },
      { name: "Achimota", slug: "achimota" },
      { name: "Ga Central", slug: "ga-central" },
      { name: "Ga West", slug: "ga-west" },
      { name: "Ga South", slug: "ga-south" },
      { name: "Tema Motorway", slug: "tema-motorway" },
      { name: "Nungua", slug: "nungua" },
      { name: "Tema", slug: "tema" },
      { name: "Ashaiman", slug: "ashaiman" },
      { name: "Ada", slug: "ada" },
      { name: "Shai Osudoku", slug: "shai-osudoku" },
    ],
  },
  {
    name: "Ashanti Region",
    slug: "ashanti-region",
    districts: [
      { name: "Adansi Asokwa District", slug: "adansi-asokwa-district" },
      { name: "Adansi North District", slug: "adansi-north-district" },
      { name: "Adansi South District", slug: "adansi-south-district" },
      { name: "Afigya Kwabre North District", slug: "afigya-kwabre-north-district" },
      { name: "Afigya Kwabre South District", slug: "afigya-kwabre-south-district" },
      { name: "Ahafo Ano North Municipal", slug: "ahafo-ano-north-municipal" },
      { name: "Ahafo Ano South East District", slug: "ahafo-ano-south-east-district" },
      { name: "Ahafo Ano South West District", slug: "ahafo-ano-south-west-district" },
      { name: "Akrofuom District", slug: "akrofuom-district" },
      { name: "Amansie Central District", slug: "amansie-central-district" },
      { name: "Amansie South District", slug: "amansie-south-district" },
      { name: "Amansie West District", slug: "amansie-west-district" },
      { name: "Asante Akim Central Municipal", slug: "asante-akim-central-municipal" },
      { name: "Asante Akim North District", slug: "asante-akim-north-district" },
      { name: "Asante Akim South Municipal", slug: "asante-akim-south-municipal" },
      { name: "Asokore Mampong Municipal", slug: "asokore-mampong-municipal" },
      { name: "Asokwa Municipal", slug: "asokwa-municipal" },
      { name: "Atwima Kwanwoma District", slug: "atwima-kwanwoma-district" },
      { name: "Atwima Mponua District", slug: "atwima-mponua-district" },
      { name: "Atwima Nwabiagya North District", slug: "atwima-nwabiagya-north-district" },
      { name: "Atwima Nwabiagya Municipal", slug: "atwima-nwabiagya-municipal" },
      { name: "Bekwai Municipal", slug: "bekwai-municipal" },
      { name: "Bosome Freho District", slug: "bosome-freho-district" },
      { name: "Bosomtwe District", slug: "bosomtwe-district" },
      { name: "Ejisu Municipal", slug: "ejisu-municipal" },
      { name: "Ejura Sekyedumase Municipal", slug: "ejura-sekyedumase-municipal" },
      { name: "Juaben Municipal", slug: "juaben-municipal" },
      { name: "Kumasi Metropolitan", slug: "kumasi-metropolitan" },
      { name: "Kwabre East Municipal", slug: "kwabre-east-municipal" },
      { name: "Kwadaso Municipal", slug: "kwadaso-municipal" },
      { name: "Mampong Municipal", slug: "mampong-municipal" },
      { name: "Obuasi East District", slug: "obuasi-east-district" },
      { name: "Obuasi Municipal", slug: "obuasi-municipal" },
      { name: "Offinso Municipal", slug: "offinso-municipal" },
      { name: "Offinso North District", slug: "offinso-north-district" },
      { name: "Oforikrom Municipal", slug: "oforikrom-municipal" },
      { name: "Old Tafo Municipal", slug: "old-tafo-municipal" },
      { name: "Sekyere Afram Plains District", slug: "sekyere-afram-plains-district" },
      { name: "Sekyere Central District", slug: "sekyere-central-district" },
      { name: "Sekyere Kumawu District", slug: "sekyere-kumawu-district" },
      { name: "Sekyere South District", slug: "sekyere-south-district" },
      { name: "Suame Municipal", slug: "suame-municipal" },
    ],
  },
  {
    name: "Central Region",
    slug: "central-region",
    districts: [
      { name: "Abura/Asebu/Kwamankese District", slug: "abura-asebu-kwamankese-district" },
      { name: "Agona East District", slug: "agona-east-district" },
      { name: "Agona West Municipal", slug: "agona-west-municipal" },
      { name: "Ajumako/Enyan/Essiam District", slug: "ajumako-enyan-essiam-district" },
      { name: "Asikuma/Odoben/Brakwa District", slug: "asikuma-odoben-brakwa-district" },
      { name: "Assin North District", slug: "assin-north-district" },
      { name: "Assin South District", slug: "assin-south-district" },
      { name: "Awutu Senya East Municipal", slug: "awutu-senya-east-municipal" },
      { name: "Awutu Senya West District", slug: "awutu-senya-west-district" },
      { name: "Cape Coast Metropolitan", slug: "cape-coast-metropolitan" },
      { name: "Effutu Municipal", slug: "effutu-municipal" },
      { name: "Ekumfi District", slug: "ekumfi-district" },
      { name: "Gomoa Central District", slug: "gomoa-central-district" },
      { name: "Gomoa East District", slug: "gomoa-east-district" },
      { name: "Gomoa West District", slug: "gomoa-west-district" },
      { name: "Hemang Lower Denkyira District", slug: "hemang-lower-denkyira-district" },
      { name: "Komenda/Edina/Eguafo/Abirem Municipal", slug: "komenda-edina-eguafo-abirem-municipal" },
      { name: "Mfantsiman Municipal", slug: "mfantsiman-municipal" },
      { name: "Twifo Atti Morkwa District", slug: "twifo-atti-morkwa-district" },
      { name: "Twifo Hemang Lower Denkyira District", slug: "twifo-hemang-lower-denkyira-district" },
      { name: "Upper Denkyira East Municipal", slug: "upper-denkyira-east-municipal" },
      { name: "Upper Denkyira West District", slug: "upper-denkyira-west-district" },
    ],
  },
  {
    name: "Ahafo",
    slug: "ahafo",
    districts: [
      { name: "Asunafo North Municipal", slug: "asunafo-north-municipal" },
      { name: "Asunafo South District", slug: "asunafo-south-district" },
      { name: "Asutifi North District", slug: "asutifi-north-district" },
      { name: "Asutifi South District", slug: "asutifi-south-district" },
      { name: "Tano North Municipal", slug: "tano-north-municipal" },
      { name: "Tano South Municipal", slug: "tano-south-municipal" },
    ],
  },
  {
    name: "Bono",
    slug: "bono",
    districts: [
      { name: "Banda District", slug: "banda-district" },
      { name: "Berekum East Municipal", slug: "berekum-east-municipal" },
      { name: "Berekum West District", slug: "berekum-west-district" },
      { name: "Dormaa Central Municipal", slug: "dormaa-central-municipal" },
      { name: "Dormaa East District", slug: "dormaa-east-district" },
      { name: "Dormaa West District", slug: "dormaa-west-district" },
      { name: "Jaman North District", slug: "jaman-north-district" },
      { name: "Jaman South Municipal", slug: "jaman-south-municipal" },
      { name: "Sunyani Municipal", slug: "sunyani-municipal" },
      { name: "Sunyani West District", slug: "sunyani-west-district" },
      { name: "Tain District", slug: "tain-district" },
      { name: "Wenchi Municipal", slug: "wenchi-municipal" },
    ],
  },
  {
    name: "Bono East",
    slug: "bono-east",
    districts: [
      { name: "Atebubu-Amantin Municipal", slug: "atebubu-amantin-municipal" },
      { name: "Kintampo North Municipal", slug: "kintampo-north-municipal" },
      { name: "Kintampo South District", slug: "kintampo-south-district" },
      { name: "Nkoranza North District", slug: "nkoranza-north-district" },
      { name: "Nkoranza South Municipal", slug: "nkoranza-south-municipal" },
      { name: "Pru East District", slug: "pru-east-district" },
      { name: "Pru West District", slug: "pru-west-district" },
      { name: "Sene East District", slug: "sene-east-district" },
      { name: "Sene West District", slug: "sene-west-district" },
      { name: "Techiman Metropolitan", slug: "techiman-metropolitan" },
      { name: "Techiman North District", slug: "techiman-north-district" },
    ],
  },
  {
    name: "Eastern",
    slug: "eastern",
    districts: [
      { name: "Abuakwa North Municipal", slug: "abuakwa-north-municipal" },
      { name: "Abuakwa South Municipal", slug: "abuakwa-south-municipal" },
      { name: "Afram Plains North District", slug: "afram-plains-north-district" },
      { name: "Afram Plains South District", slug: "afram-plains-south-district" },
      { name: "Akyemansa District", slug: "akyemansa-district" },
      { name: "Asene Manso Akroso District", slug: "asene-manso-akroso-district" },
      { name: "Asuogyaman District", slug: "asuogyaman-district" },
      { name: "Atiwa East District", slug: "atiwa-east-district" },
      { name: "Atiwa West District", slug: "atiwa-west-district" },
      { name: "Ayensuano District", slug: "ayensuano-district" },
      { name: "Birim Central Municipal", slug: "birim-central-municipal" },
      { name: "Birim North District", slug: "birim-north-district" },
      { name: "Birim South District", slug: "birim-south-district" },
      { name: "Denkyembour District", slug: "denkyembour-district" },
      { name: "Fanteakwa North District", slug: "fanteakwa-north-district" },
      { name: "Fanteakwa South District", slug: "fanteakwa-south-district" },
      { name: "Kwaebibirem Municipal", slug: "kwaebibirem-municipal" },
      { name: "Kwahu Afram Plains North District", slug: "kwahu-afram-plains-north-district" },
      { name: "Kwahu East District", slug: "kwahu-east-district" },
      { name: "Kwahu South District", slug: "kwahu-south-district" },
      { name: "Kwahu West Municipal", slug: "kwahu-west-municipal" },
      { name: "Lower Manya Krobo Municipal", slug: "lower-manya-krobo-municipal" },
      { name: "New Juaben North Municipal", slug: "new-juaben-north-municipal" },
      { name: "New Juaben South Municipal", slug: "new-juaben-south-municipal" },
      { name: "Nsawam Adoagyiri Municipal", slug: "nsawam-adoagyiri-municipal" },
      { name: "Okere District", slug: "okere-district" },
      { name: "Suhum Municipal", slug: "suhum-municipal" },
      { name: "Upper Manya Krobo District", slug: "upper-manya-krobo-district" },
      { name: "Upper West Akim District", slug: "upper-west-akim-district" },
      { name: "West Akim Municipal", slug: "west-akim-municipal" },
      { name: "Yilo Krobo Municipal", slug: "yilo-krobo-municipal" },
    ],
  },
  {
    name: "North East",
    slug: "north-east",
    districts: [
      { name: "Bunkpurugu-Nakpanduri District", slug: "bunkpurugu-nakpanduri-district" },
      { name: "Chereponi District", slug: "chereponi-district" },
      { name: "East Mamprusi Municipal", slug: "east-mamprusi-municipal" },
      { name: "Mamprugu Moagduri District", slug: "mamprugu-moagduri-district" },
      { name: "West Mamprusi Municipal", slug: "west-mamprusi-municipal" },
      { name: "Yunyoo-Nasuan District", slug: "yunyoo-nasuan-district" },
    ],
  },
  {
    name: "Northern",
    slug: "northern",
    districts: [
      { name: "Gushegu Municipal", slug: "gushegu-municipal" },
      { name: "Karaga District", slug: "karaga-district" },
      { name: "Kpandai District", slug: "kpandai-district" },
      { name: "Kumbungu District", slug: "kumbungu-district" },
      { name: "Mion District", slug: "mion-district" },
      { name: "Nanton District", slug: "nanton-district" },
      { name: "Nanumba North Municipal", slug: "nanumba-north-municipal" },
      { name: "Nanumba South District", slug: "nanumba-south-district" },
      { name: "Saboba District", slug: "saboba-district" },
      { name: "Sagnarigu Municipal", slug: "sagnarigu-municipal" },
      { name: "Savelugu Municipal", slug: "savelugu-municipal" },
      { name: "Tatale-Sanguli District", slug: "tatale-sanguli-district" },
      { name: "Tamale Metropolitan", slug: "tamale-metropolitan" },
      { name: "Tolon District", slug: "tolon-district" },
      { name: "Yendi Municipal", slug: "yendi-municipal" },
      { name: "Zabzugu District", slug: "zabzugu-district" },
    ],
  },
  {
    name: "Oti",
    slug: "oti",
    districts: [
      { name: "Biakoye District", slug: "biakoye-district" },
      { name: "Guan District", slug: "guan-district" },
      { name: "Jasikan District", slug: "jasikan-district" },
      { name: "Kadjebi District", slug: "kadjebi-district" },
      { name: "Krachi East Municipal", slug: "krachi-east-municipal" },
      { name: "Krachi Nchumuru District", slug: "krachi-nchumuru-district" },
      { name: "Krachi West District", slug: "krachi-west-district" },
      { name: "Nkwanta North District", slug: "nkwanta-north-district" },
      { name: "Nkwanta South Municipal", slug: "nkwanta-south-municipal" },
    ],
  },
  {
    name: "Savannah",
    slug: "savannah",
    districts: [
      { name: "Bole District", slug: "bole-district" },
      { name: "Central Gonja District", slug: "central-gonja-district" },
      { name: "East Gonja Municipal", slug: "east-gonja-municipal" },
      { name: "North East Gonja District", slug: "north-east-gonja-district" },
      { name: "North Gonja District", slug: "north-gonja-district" },
      { name: "Sawla-Tuna-Kalba District", slug: "sawla-tuna-kalba-district" },
      { name: "West Gonja Municipal", slug: "west-gonja-municipal" },
    ],
  },
  {
    name: "Upper East",
    slug: "upper-east",
    districts: [
      { name: "Bawku Municipal", slug: "bawku-municipal" },
      { name: "Bawku West District", slug: "bawku-west-district" },
      { name: "Binduri District", slug: "binduri-district" },
      { name: "Bolgatanga East District", slug: "bolgatanga-east-district" },
      { name: "Bolgatanga Municipal", slug: "bolgatanga-municipal" },
      { name: "Bongo District", slug: "bongo-district" },
      { name: "Builsa North Municipal", slug: "builsa-north-municipal" },
      { name: "Builsa South District", slug: "builsa-south-district" },
      { name: "Garu District", slug: "garu-district" },
      { name: "Kassena-Nankana Municipal", slug: "kassena-nankana-municipal" },
      { name: "Kassena-Nankana West District", slug: "kassena-nankana-west-district" },
      { name: "Nabdam District", slug: "nabdam-district" },
      { name: "Pusiga District", slug: "pusiga-district" },
      { name: "Talensi District", slug: "talensi-district" },
      { name: "Tempane District", slug: "tempane-district" },
    ],
  },
  {
    name: "Upper West",
    slug: "upper-west",
    districts: [
      { name: "Daffiama-Bussie-Issa District", slug: "daffiama-bussie-issa-district" },
      { name: "Jirapa Municipal", slug: "jirapa-municipal" },
      { name: "Lambussie District", slug: "lambussie-district" },
      { name: "Lawra Municipal", slug: "lawra-municipal" },
      { name: "Nadowli-Kaleo District", slug: "nadowli-kaleo-district" },
      { name: "Nandom Municipal", slug: "nandom-municipal" },
      { name: "Sissala East Municipal", slug: "sissala-east-municipal" },
      { name: "Sissala West District", slug: "sissala-west-district" },
      { name: "Wa East District", slug: "wa-east-district" },
      { name: "Wa Municipal", slug: "wa-municipal" },
      { name: "Wa West District", slug: "wa-west-district" },
    ],
  },
  {
    name: "Volta",
    slug: "volta",
    districts: [
      { name: "Adaklu District", slug: "adaklu-district" },
      { name: "Afadzato South District", slug: "afadzato-south-district" },
      { name: "Agotime Ziope District", slug: "agotime-ziope-district" },
      { name: "Akatsi North District", slug: "akatsi-north-district" },
      { name: "Akatsi South District", slug: "akatsi-south-district" },
      { name: "Anloga District", slug: "anloga-district" },
      { name: "Central Tongu District", slug: "central-tongu-district" },
      { name: "Ho Municipal", slug: "ho-municipal" },
      { name: "Ho West District", slug: "ho-west-district" },
      { name: "Hohoe Municipal", slug: "hohoe-municipal" },
      { name: "Keta Municipal", slug: "keta-municipal" },
      { name: "Ketu North Municipal", slug: "ketu-north-municipal" },
      { name: "Ketu South Municipal", slug: "ketu-south-municipal" },
      { name: "Kpando Municipal", slug: "kpando-municipal" },
      { name: "North Dayi District", slug: "north-dayi-district" },
      { name: "North Tongu District", slug: "north-tongu-district" },
      { name: "South Dayi District", slug: "south-dayi-district" },
      { name: "South Tongu District", slug: "south-tongu-district" },
    ],
  },
  {
    name: "Western",
    slug: "western",
    districts: [
      { name: "Ahanta West Municipal", slug: "ahanta-west-municipal" },
      { name: "Effia Kwesimintsim Municipal", slug: "effia-kwesimintsim-municipal" },
      { name: "Ellembelle District", slug: "ellembelle-district" },
      { name: "Jomoro Municipal", slug: "jomoro-municipal" },
      { name: "Mpohor District", slug: "mpohor-district" },
      { name: "Nzema East Municipal", slug: "nzema-east-municipal" },
      { name: "Prestea Huni-Valley Municipal", slug: "prestea-huni-valley-municipal" },
      { name: "Sekondi Takoradi Metropolitan", slug: "sekondi-takoradi-metropolitan" },
      { name: "Shama District", slug: "shama-district" },
      { name: "Tarkwa-Nsuaem Municipal", slug: "tarkwa-nsuaem-municipal" },
      { name: "Wassa Amenfi Central District", slug: "wassa-amenfi-central-district" },
      { name: "Wassa Amenfi East Municipal", slug: "wassa-amenfi-east-municipal" },
      { name: "Wassa Amenfi West Municipal", slug: "wassa-amenfi-west-municipal" },
    ],
  },
  {
    name: "Western North",
    slug: "western-north",
    districts: [
      { name: "Aowin Municipal", slug: "aowin-municipal" },
      { name: "Bia East District", slug: "bia-east-district" },
      { name: "Bia West District", slug: "bia-west-district" },
      { name: "Bibiani Anhwiaso Bekwai Municipal", slug: "bibiani-anhwiaso-bekwai-municipal" },
      { name: "Bodi District", slug: "bodi-district" },
      { name: "Juaboso District", slug: "juaboso-district" },
      { name: "Sefwi Akontombra District", slug: "sefwi-akontombra-district" },
      { name: "Suaman District", slug: "suaman-district" },
      { name: "Wiawso Municipal", slug: "wiawso-municipal" },
    ],
  },
];

export const GHANA_ALL_DISTRICTS: District[] = GHANA_REGIONS.flatMap((r) => r.districts);

// Real listing.location values don't always match a district's full official
// name -- e.g. a listing might say "Kumasi" while the district is named
// "Kumasi Metropolitan", or "Takoradi" while the district is
// "Sekondi Takoradi Metropolitan". Two-pass matching: exact name first (so
// "Tema" resolves to the district literally named "Tema" rather than also
// catching "Tema Motorway"), then falls back to a whole-word match against
// the district name's space-separated tokens.
export function matchLocationToDistrict(location: string, regions: Region[]): District | null {
  const loc = location.trim().toLowerCase();
  if (!loc) return null;

  for (const region of regions) {
    for (const district of region.districts) {
      if (district.name.toLowerCase() === loc) return district;
    }
  }
  for (const region of regions) {
    for (const district of region.districts) {
      const tokens = district.name.toLowerCase().split(/[\s/]+/);
      if (tokens.includes(loc)) return district;
    }
  }
  return null;
}

// Aggregates raw location->count pairs (exact strings as stored on listings)
// into per-district counts, keyed by district slug so districts with the
// same name in different regions can't collide.
export function buildDistrictCounts(
  locationCounts: Record<string, number>,
  regions: Region[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [location, count] of Object.entries(locationCounts)) {
    const district = matchLocationToDistrict(location, regions);
    if (district) {
      result[district.slug] = (result[district.slug] ?? 0) + count;
    }
  }
  return result;
}
