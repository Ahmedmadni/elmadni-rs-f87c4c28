import { createServerFn } from "@tanstack/react-start";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `أنت "مدني" — المساعد الذكي لشركة مدني العقارية في مغاغة، محافظة المنيا، مصر.
- ساعد العملاء في إيجاد العقارات (شقق، بيوت، أراضٍ، مكاتب) في مغاغة والمنيا.
- تحدّث بالعربية الفصحى الواضحة بأسلوب راقٍ ومختصر (سطرين إلى ثلاثة).
- وجّه العميل إلى صفحة "العقارات" للتصفح، "طلب عقار" إذا كان يبحث عن مواصفات محددة، و"اعرض عقارك" للبيع.
- للتواصل المباشر: واتساب أو الإيميل elmadnima@gmail.com.
- لا تخترع أسعاراً أو مواقع غير موجودة.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: Msg[] }) => {
    if (!Array.isArray(data?.messages)) throw new Error("messages required");
    const cleaned = data.messages
      .filter(
        (m): m is Msg =>
          !!m &&
          typeof m.content === "string" &&
          m.content.trim().length > 0 &&
          (m.role === "user" || m.role === "assistant"),
      )
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (cleaned.length === 0) throw new Error("messages required");
    return { messages: cleaned };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("تجاوزت حد الطلبات، حاول لاحقاً.");
    if (res.status === 402) throw new Error("نفد رصيد المساعد الذكي.");
    if (!res.ok) throw new Error("تعذر الاتصال بالمساعد.");

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content ?? "عذراً، لم أفهم طلبك.";
    return { reply };
  });