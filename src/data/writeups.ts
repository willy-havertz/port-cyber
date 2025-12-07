// Writeup detail data - extracted from PDFs
export interface WriteupDetail {
  id: string;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date: string;
  timeSpent: string;
  tags: string[];
  writeupUrl: string;
  // New detailed content fields
  overview: string;
  methodology: string[];
  keyFindings: string[];
  toolsUsed: string[];
  lessonsLearned: string[];
}

// Fowsniff writeup details extracted from PDF
export const fowsniffWriteup: WriteupDetail = {
  id: "fowsniff",
  title: "Fowsniff - Linux Privilege Escalation via Misconfigured MOTD",
  platform: "Try Hack Me",
  difficulty: "Easy",
  category: "Linux",
  date: "Nov 20, 2025",
  timeSpent: "1hr 30min",
  tags: [
    "port scanning",
    "email service exploitation",
    "password cracking",
    "privilege escalation",
  ],
  writeupUrl: "/writeups/Fowsniff_ctf.pdf",
  overview:
    "Fowsniff is an easy-level Linux privilege escalation challenge that demonstrates the dangers of misconfigured Message of the Day (MOTD) scripts. The challenge involves port scanning to discover services, exploiting an email service vulnerability to extract credentials, and leveraging a custom MOTD script to achieve privilege escalation.",
  methodology: [
    "Performed comprehensive port scanning using nmap to identify open services",
    "Discovered exposed email service running on the target",
    "Exploited email service to extract user credentials and sensitive information",
    "Used obtained credentials to gain initial access via SSH",
    "Analyzed MOTD scripts and discovered privilege escalation vector",
    "Leveraged misconfigured MOTD to execute commands as root",
    "Successfully obtained system flags and root access",
  ],
  keyFindings: [
    "Email service was improperly configured and exposed sensitive data",
    "Weak credential management allowed easy access with extracted passwords",
    "MOTD scripts executed with elevated privileges without proper input validation",
    "Lack of security controls in startup scripts led to privilege escalation",
  ],
  toolsUsed: [
    "nmap - Network scanning and service enumeration",
    "SSH - Secure shell for remote access",
    "Bash - Shell scripting and command execution",
    "grep/awk - Text processing and data extraction",
  ],
  lessonsLearned: [
    "Always validate and sanitize input in system-wide scripts",
    "Implement proper access controls on sensitive services",
    "Review startup scripts and MOTD configurations regularly",
    "Principle of least privilege should be applied to all processes",
    "Service enumeration is critical in the initial reconnaissance phase",
  ],
};

// Example of another writeup (Lame)
export const lameWriteup: WriteupDetail = {
  id: "lame",
  title: "Lame - Classic Linux Privilege Escalation",
  platform: "Hack The Box",
  difficulty: "Easy",
  category: "Linux",
  date: "Jan 18, 2025",
  timeSpent: "1.5 hours",
  tags: ["linux", "samba", "exploit", "privesc"],
  writeupUrl: "/writeups/lame.pdf",
  overview:
    "Lame is a classic Hack The Box machine that demonstrates exploitation of vulnerable Samba service and Unix socket privilege escalation. This machine is often one of the first challenges tackled by penetration testers.",
  methodology: [
    "Performed port scanning to identify Samba service on port 139/445",
    "Enumerated Samba shares using smbclient and found accessible shares",
    "Exploited Samba vulnerability to gain initial shell access",
    "Uploaded reverse shell payload to accessible share",
    "Executed payload to establish reverse shell connection",
    "Escalated privileges using Unix socket vulnerability",
  ],
  keyFindings: [
    "Outdated Samba version contained known exploitable vulnerabilities",
    "Writable shares allowed arbitrary file upload",
    "Weak service permissions enabled privilege escalation",
  ],
  toolsUsed: [
    "nmap - Port and service scanning",
    "smbclient - SMB protocol interaction",
    "msfconsole - Metasploit framework",
    "nc/bash - Reverse shell generation",
  ],
  lessonsLearned: [
    "Keep all services patched and updated",
    "Restrict file share permissions appropriately",
    "Monitor for unusual file operations on shares",
  ],
};

// Map writeup IDs to their details
export const writeupDetailsMap: Record<string, WriteupDetail> = {
  fowsniff: fowsniffWriteup,
  lame: lameWriteup,
};

// Get writeup detail by ID
export const getWriteupDetail = (id: string): WriteupDetail | undefined => {
  return writeupDetailsMap[id];
};
