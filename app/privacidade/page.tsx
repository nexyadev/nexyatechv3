import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
import styles from "./privacy.module.css";

export const metadata = pageMetadata("Política de privacidade", "Entenda como o site da NEXYA Tech trata as informações do formulário, o armazenamento da abertura e os links para serviços externos.", "/privacidade");

const sections = [
  { id: "informacoes", label: "Informações do formulário" },
  { id: "whatsapp", label: "Contato pelo WhatsApp" },
  { id: "armazenamento", label: "Cookies e armazenamento" },
  { id: "servicos-externos", label: "Serviços externos" },
  { id: "seus-dados", label: "Dúvidas e solicitações" },
];

export default function PrivacyPage() {
  return <>
    <PageIntro eyebrow="Transparência / Privacidade" title="Sua informação merece cuidado." description="Esta política explica como funciona o tratamento de informações neste site institucional da NEXYA Tech." />
    <div className={`container ${styles.layout}`}>
      <aside className={styles.aside}><p>Última atualização<br /><time dateTime="2026-11-06">6 de novembro de 2026</time></p><nav aria-label="Seções da política de privacidade">{sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav></aside>
      <div className={styles.content}>
        <section id="informacoes"><h2>01. Informações do formulário</h2><p>O formulário de contato solicita nome, e-mail, empresa (opcional), solução de interesse e uma descrição do projeto. Essas informações são usadas para preparar uma mensagem de contato com a NEXYA.</p><p><strong>O formulário desta versão não envia informações para um banco de dados nem para um serviço de e-mail.</strong> O preenchimento e a preparação do briefing acontecem no seu navegador. Os valores ficam no estado temporário da página enquanto ela está aberta. Seu navegador pode oferecer recursos próprios de preenchimento automático.</p><p>Não inclua senhas, documentos pessoais, dados de pagamento ou outras informações sensíveis na descrição do projeto.</p></section>
        <section id="whatsapp"><h2>02. Contato pelo WhatsApp</h2><p>Depois de preparar o briefing, você pode revisar a mensagem e escolher “Continuar no WhatsApp”. Essa ação abre um link do WhatsApp contendo o texto preparado. O envio da conversa à NEXYA depende da sua confirmação dentro do WhatsApp.</p><p>Você também pode usar o link direto de contato, sem preencher o formulário. Ao iniciar uma conversa, o WhatsApp e a NEXYA terão acesso às informações que você compartilhar por esse canal, incluindo os dados do seu perfil disponibilizados pelo serviço.</p><p>As informações recebidas são usadas para conversar sobre sua solicitação, entender o projeto e dar continuidade ao atendimento. O funcionamento e o tratamento de dados pelo WhatsApp seguem as políticas do próprio serviço.</p></section>
        <section id="armazenamento"><h2>03. Cookies e armazenamento local</h2><p>Esta versão do site não inclui ferramentas de análise de audiência, pixels de publicidade ou cookies de rastreamento próprios.</p><p>A abertura visual pode usar <strong>armazenamento de sessão do navegador</strong> para registrar apenas que a animação já foi exibida. Esse registro evita repetições excessivas durante a mesma sessão e não contém dados do formulário. Você pode removê-lo pelas configurações do navegador.</p><p>A infraestrutura usada para disponibilizar o site pode tratar informações técnicas de conexão, como endereço IP e requisições, necessárias ao funcionamento e à segurança da hospedagem. A configuração de produção deve ser refletida nesta política quando houver mudanças.</p></section>
        <section id="servicos-externos"><h2>04. Links para outros serviços</h2><p>O site contém links para WhatsApp, Instagram e NEXYA Auto. Ao abrir esses destinos, você passa a utilizar um serviço ou site com regras próprias de privacidade.</p><p>A criação de conta e o uso da NEXYA Auto ocorrem no ambiente do produto, separados deste site institucional. Consulte as informações disponíveis no produto antes de fornecer dados de cadastro.</p></section>
        <section id="seus-dados"><h2>05. Dúvidas e solicitações sobre seus dados</h2><p>Para perguntar sobre o uso das informações que você compartilhou com a NEXYA ou solicitar acesso, correção ou exclusão, entre em contato e identifique a conversa ou solicitação relacionada.</p><p>{siteConfig.whatsappUrl ? <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">Falar com a NEXYA pelo WhatsApp</a> : <Link href="/contato">Acessar a página de contato</Link>}.</p></section>
        <section id="atualizacoes"><h2>06. Atualizações desta política</h2><p>Esta política deve acompanhar mudanças no funcionamento do site, no formulário, nos serviços utilizados e nos canais de atendimento. A data no início desta página informa a última atualização do texto.</p></section>
      </div>
    </div>
  </>;
}
