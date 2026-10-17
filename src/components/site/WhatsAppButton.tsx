import { ButtonLink } from "@/components/ui/ButtonLink";
import { ChatIcon } from "@/components/ui/icons";
import { formatInternationalDz, whatsappLink } from "@/shared/format";

type Props = { number: string; message: string; block?: boolean; short?: boolean };

export function WhatsAppButton({ number, message, block, short }: Props) {
  return (
    <ButtonLink href={whatsappLink(number, message)} variant="whatsapp" block={block}>
      <ChatIcon />
      {short ? "WhatsApp" : `WhatsApp · ${formatInternationalDz(number)}`}
    </ButtonLink>
  );
}
