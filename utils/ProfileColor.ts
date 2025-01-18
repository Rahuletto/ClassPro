function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return Math.abs(hash);
}

export const colors: string[] = [
	"#FFAC81",
	"#7EC8BD",
	"#9CA3DB",
	"#EFE9AE",
	"#64f58d",
	"#EA8592",
	"#E0FE9A",
	"#FF928B",
	"#8789AB",
	"#8BCAE5",
	"#A5D8FF",
	"#FFCCF9",
	"#F4C2C2",
	"#C1E1C1",
	"#FFD1DC",
	"#FFDFD3",
	"#B5EAD7",
	"#FFC3A0",
	"#D4A5A5",
	"#FFABAB",
	"#F5E1A4",
	"#AFCBFF",
	"#C7CEEA",
	"#FFB7C5",
	"#FFDAC1",
	"#E2F0CB",
	"#D0E6A5",
	"#B5EAD7",
	"#E3B5A4",
	"#FFC9A9",
	"#D3C2C9",
	"#FFD6E5",
	"#E0BBE4",
	"#C7D3F3",
	"#F3FFE3",
	"#FAD0C3",
	"#E6E6FA",
	"#FFB6B9",
	"#A1CAF1",
	"#D2E1FF",
	"#FFB3BA",
	"#FFDEB5",
	"#D1C2E5",
	"#FFEFBA",
	"#BDECB6",
	"#FFB4A2",
	"#C5B5E3",
	"#FDD7E4",
	"#E8D7FF",
	"#F9C8C9",
	"#F4B2A7",
	"#D4B5B0",
	"#E8C1A0",
	"#FFF2CC",
	"#D9F0FF",
	"#E8A5A5",
	"#FAE1DD",
	"#D7C1E0",
	"#FFCCBC",
	"#F4E1D2",
	"#FFAAA5",
	"#D4ECDD",
	"#E8B4BC",
	"#FDC5F5",
	"#FFDEE9",
	"#B5D8C7",
	"#C1E1E3",
	"#FAD3E7",
	"#FFE3E3",
	"#FFD6A5",
	"#FFF5E1",
	"#D6E4F0",
	"#C2F5E3",
	"#FFE1A8",
	"#FFD5C2",
	"#FFD8E0",
	"#DCE2F0",
	"#FFBED8",
	"#FFD9C0",
	"#E6CFCF",
	"#EFD5B3",
	"#FFF3CA",
	"#FAEBD7",
	"#D5F0E5",
	"#F5D3E0",
	"#E7F2E9",
	"#FFCECE",
	"#FFE4E1",
	"#F8E2E1",
	"#F2E0D0",
	"#FAD9D9",
	"#E5D8D6",
	"#F8D8DD",
	"#F5E7E6",
];

export function profileColor(registrationNumber: string): string {
	if (registrationNumber === undefined) return colors[0];
	const hash = hashString(registrationNumber);
	const colorIndex = hash % colors.length;
	return colors[colorIndex];
}