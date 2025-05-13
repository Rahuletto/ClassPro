export interface DirLink {
	site: string;
	url: string;
	type: "official" | "unofficial" | "void" | string;
	description: string;
}

export const priorityUrl: DirLink[] = [
	// {
	//   site: "Bulletin",
	//   url: "#",
	//   type: "void",
	//   description:
	//     "A centralized online platform to discover various events that happen in SRM.",
	// },
	{
		site: "Docupro",
		url: "https://docu-pro.vercel.app",
		type: "void",
		description: "Past exam papers at your fingertips.",
	},
	{
		site: "Better-Lab",
		url: "https://better-lab.vercel.app",
		type: "void",
		description:
			"A better alternative to SRM-Elab. Efficient, Fast, Zippy as hecc",
	},
	{
		site: "Grade Calculator",
		url: "https://gradex.vercel.app",
		type: "void",
		description: "Quickly calculate your grades and GPA",
	},
];

export const urls: DirLink[] = [
	{
		site: "What's in my mess",
		url: "https://whatsinmess.vercel.app/",
		type: "unofficial",
		description: "Check today’s mess menu.",
	},
	{
		site: "KaizenKlass",
		url: "https://kaizenklass.xyz/",
		type: "unofficial",
		description: "Get your notes, assignments and every resource you need.",
	},
	{
		site: "EveHubSrm",
		url: "https://evehubsrm.vercel.app/",
		type: "unofficial",
		description: "Explore SRM events and activities.",
	},
	{
		site: "Uniclubs",
		url: "https://uni-clubs.vercel.app/",
		type: "unofficial",
		description: "Find a perfect club for you in SRM.",
	},
	{
		site: "Leave Portal",
		url: "http://10.1.105.62/srmleaveapp",
		type: "official",
		description: "Apply for leave easily.",
	},
	{
		site: "Map",
		url: "/map",
		type: "official",
		description: "Navigate around campus.",
	},
	{
		site: "Events",
		url: "https://www.srmist.edu.in/events/",
		type: "official",
		description: "Stay updated with campus events.",
	},
	{
		site: "E-Library",
		url: "https://emanager.srmist.edu.in/elibrary/Home.jsp",
		type: "official",
		description: "Access digital library resources.",
	},
	{
		site: "Question papers",
		url: "http://dspace.srmist.edu.in/dspace",
		type: "official",
		description: "Find past exam papers. dspace.",
	},
	{
		site: "Weather",
		url: "https://srmaoml.wixsite.com/home/forecast",
		type: "official",
		description: "Get the latest weather updates.",
	},
	{
		site: "Staff Finder",
		url: "https://www.srmist.edu.in/staff-finder/",
		type: "official",
		description: "Locate staff contact details.",
	},
	{
		site: "Course Feedback",
		url: "https://academia.srmist.edu.in/#Course_Feedback",
		type: "official",
		description: "Submit feedback for your courses.",
	},
	{
		site: "Online Education",
		url: "https://www.srmonline.in/",
		type: "official",
		description: "Access online courses and resources.",
	},
	{
		site: "Online Resources",
		url: "https://www.srmist.edu.in/library/online-resources/",
		type: "official",
		description: "Explore various online resources.",
	},
	{
		site: "Student Portal",
		url: "https://sp.srmist.edu.in",
		type: "official",
		description: "Manage your student profile.",
	},
	{
		site: "Service Desk",
		url: "https://sd.srmist.edu.in",
		type: "official",
		description: "Get IT and service support.",
	},
	{
		site: "Service Request",
		url: "/ssr",
		type: "official",
		description: "Submit service requests.",
	},
	{
		site: "Hostel Booking",
		url: "https://sp.srmist.edu.in",
		type: "official",
		description: "Book your hostel room.",
	},
	{
		site: "Bus Booking",
		url: "https://sp.srmist.edu.in",
		type: "official",
		description: "Reserve a seat on the bus.",
	},
	{
		site: "SRM Website",
		url: "https://srmist.edu.in",
		type: "official",
		description: "Visit the SRM homepage.",
	},
	{
		site: "SRM Wifi",
		url: "https://iac.srmist.edu.in/Connect/PortalMain",
		type: "official",
		description: "Connect to campus WiFi.",
	},
	{
		site: "Hostel Wifi",
		url: "https://iach.srmist.edu.in/Connect/PortalMain",
		type: "official",
		description: "Connect to hostel WiFi.",
	},
	{
		site: "Service desk",
		url: "https://itkmservicedesk.srmist.edu.in/",
		type: "official",
		description: "Get help from the IT desk.",
	},
	{
		site: "Research Opportunities Program",
		url: "https://uropmfp.srmist.edu.in/fund/index.php",
		type: "official",
		description: "Apply for Research Funding",
	},
	{
		site: "SRM Margin Check",
		url: "https://chromewebstore.google.com/detail/srm-margin-check/dofniecopchojcnidpeiodcfnodlenph",
		type: "unofficial",
		description: "Chrome extension to make academia better.",
	},
	{
		site: "Acehive",
		url: "https://acehive.vercel.app",
		type: "unofficial",
		description: "Your one-stop destination for Resources.",
	},
].sort((a, b) => a.site.localeCompare(b.site));
