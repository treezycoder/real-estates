export type AgentFormValues = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  bioEn: string;
  bioFr: string;
  photo: { url: string; fileKey: string } | null;
};

export const emptyAgentValues: AgentFormValues = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  bioEn: "",
  bioFr: "",
  photo: null,
};
