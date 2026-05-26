// Polygon coords derived from tbilisi-map.svg (800×820 px).
// Each district is an octagonal approximation of the circle used in the SVG.
// Coords format: "x1,y1,x2,y2,..." — compatible with HTML <area shape="poly">
// and SVG <polygon points="...">.
// Source circles: cx, cy, r from public/tbilisi-map.svg.

export interface District {
  name: string;
  label: string;
  coords: string;
  color: string;
}

export const DISTRICTS: District[] = [
  {
    name: "gldani",
    label: "გლდანი",
    // cx=598.5 cy=244.8 r=127
    coords: "726,245,688,335,599,372,509,335,472,245,509,155,599,118,688,155",
    color: "#BFA0D8",
  },
  {
    name: "didube",
    label: "დიდუბე",
    // cx=423.8 cy=359.1 r=76
    coords: "500,359,478,413,424,435,370,413,348,359,370,305,424,283,478,305",
    color: "#F0A080",
  },
  {
    name: "nadzaladevi",
    label: "ნაძალადევი",
    // cx=337.2 cy=383.9 r=76
    coords: "413,384,391,438,337,460,283,438,261,384,283,330,337,308,391,330",
    color: "#98D890",
  },
  {
    name: "saburtalo",
    label: "საბურთალო",
    // cx=297.5 cy=419.5 r=102
    coords: "400,420,370,492,298,522,226,492,196,420,226,347,298,318,370,347",
    color: "#82C882",
  },
  {
    name: "vake",
    label: "ვაკე",
    // cx=277.3 cy=503.3 r=102
    coords: "379,503,349,575,277,605,205,575,175,503,205,431,277,401,349,431",
    color: "#7EC8E3",
  },
  {
    name: "vera",
    label: "ვერა",
    // approximate: cx=320 cy=555 r=55 (between Vake and Chugureti)
    coords: "375,555,359,594,320,610,281,594,265,555,281,516,320,500,359,516",
    color: "#F0D0A0",
  },
  {
    name: "chugureti",
    label: "ჩუღურეთი",
    // cx=361.8 cy=549.9 r=61
    coords: "423,550,405,593,362,611,319,593,301,550,319,507,362,489,405,507",
    color: "#D4B490",
  },
  {
    name: "mtatsminda",
    label: "მთაწმინდა",
    // cx=403.6 cy=588.8 r=61
    coords: "465,589,447,632,404,650,361,632,343,589,361,546,404,528,447,546",
    color: "#F8D840",
  },
  {
    name: "old_tbilisi",
    label: "ძველი თბილისი",
    // cx=443.3 cy=602.7 r=76
    coords: "519,603,497,657,443,679,389,657,367,603,389,549,443,527,497,549",
    color: "#E8A57A",
  },
  {
    name: "isani",
    label: "ისანი",
    // cx=595.6 cy=616.9 r=76
    coords: "672,617,649,671,596,693,542,671,520,617,542,563,596,541,649,563",
    color: "#E8D860",
  },
  {
    name: "krtsanisi",
    label: "კრწანისი",
    // cx=525.6 cy=670.4 r=76
    coords: "602,670,579,724,526,746,472,724,450,670,472,616,526,594,579,616",
    color: "#88C8F0",
  },
];

export const DISTRICT_MAP_WIDTH = 800;
export const DISTRICT_MAP_HEIGHT = 820;
