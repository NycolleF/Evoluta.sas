package com.evoluta.manager.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Reuniao;
import com.evoluta.manager.model.ReuniaoArquivo;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.ReuniaoArquivoRepository;
import com.evoluta.manager.repository.ReuniaoRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@RestController
@RequestMapping("/api/reunioes")
public class ReuniaoController {
    private final ReuniaoRepository reuniaoRepository;
    private final ReuniaoArquivoRepository reuniaoArquivoRepository;
    private final ClienteRepository clienteRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public ReuniaoController(ReuniaoRepository reuniaoRepository, ReuniaoArquivoRepository reuniaoArquivoRepository, ClienteRepository clienteRepository) {
        this.reuniaoRepository = reuniaoRepository;
        this.reuniaoArquivoRepository = reuniaoArquivoRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam(required = false) String mes) {
        YearMonth ref;
        try {
            ref = parseMes(mes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        }

        return ResponseEntity.ok(
                reuniaoRepository.findByDataReuniaoBetweenOrderByDataReuniaoAscCriadoEmDesc(ref.atDay(1), ref.atEndOfMonth())
        );
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criar(
            @RequestParam Integer clienteId,
            @RequestParam LocalDate dataReuniao,
            @RequestParam(required = false) String anotacoes,
            @RequestParam(name = "arquivos", required = false) MultipartFile[] arquivos
    ) {
        Cliente cliente = clienteRepository.findById(clienteId).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Cliente nao encontrado."));
        }

        List<MultipartFile> arquivosValidos = normalizarArquivos(arquivos);
        if (arquivosValidos == null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Apenas PDF e imagens sao permitidos."));
        }

        Reuniao reuniao = new Reuniao();
        reuniao.setCliente(cliente);
        reuniao.setDataReuniao(dataReuniao);
        reuniao.setAnotacoes(anotacoes);
        reuniao.setCriadoEm(LocalDateTime.now());

        List<Path> arquivosSalvos = new ArrayList<>();
        if (!arquivosValidos.isEmpty()) {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            try {
                Files.createDirectories(dir);

                for (MultipartFile arquivo : arquivosValidos) {
                    String contentTypeSeguro = Objects.toString(arquivo.getContentType(), "").trim();
                    String original = Objects.toString(arquivo.getOriginalFilename(), "arquivo");
                    if (original.isBlank()) original = "arquivo";
                    String nome = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
                    Path destino = dir.resolve(nome);
                    Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
                    arquivosSalvos.add(destino);

                    ReuniaoArquivo meta = new ReuniaoArquivo();
                    meta.setReuniao(reuniao);
                    meta.setNomeOriginal(original);
                    meta.setNomeArmazenado(nome);
                    meta.setTipoMime(contentTypeSeguro);
                    meta.setTamanho(arquivo.getSize());
                    reuniao.getArquivos().add(meta);
                }
            } catch (IOException e) {
                limparArquivosSalvos(arquivosSalvos);
                return ResponseEntity.internalServerError().body(Map.of("mensagem", "Falha ao salvar os arquivos."));
            }
        }

        try {
            return ResponseEntity.ok(reuniaoRepository.save(reuniao));
        } catch (RuntimeException e) {
            limparArquivosSalvos(arquivosSalvos);
            return ResponseEntity.internalServerError().body(Map.of("mensagem", "Falha ao salvar a reuniao."));
        }
    }

    @GetMapping("/relatorio-pdf")
    @Transactional(readOnly = true)
    public ResponseEntity<?> gerarRelatorioPdf(@RequestParam Integer clienteId, @RequestParam(required = false) String mes) {
        Cliente cliente = clienteRepository.findById(clienteId).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Cliente nao encontrado."));
        }

        YearMonth ref;
        try {
            ref = parseMes(mes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        }

        List<Reuniao> reunioes = reuniaoRepository.findByClienteIdAndDataReuniaoBetweenOrderByDataReuniaoAscCriadoEmDesc(
                clienteId,
                ref.atDay(1),
                ref.atEndOfMonth()
        );

        try {
            byte[] pdf = montarRelatorioPdf(cliente, reunioes, ref);
            String nomeArquivo = "relatorio_reunioes_" + cliente.getNome().replaceAll("[^a-zA-Z0-9._-]", "_") + "_" + ref + ".pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                    .body(pdf);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensagem", "Falha ao gerar o relatorio PDF."));
        }
    }

    @GetMapping("/arquivos/{id}")
    public ResponseEntity<?> baixarArquivo(@PathVariable Integer id) {
        ReuniaoArquivo arquivo = reuniaoArquivoRepository.findById(id).orElse(null);
        if (arquivo == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path caminho = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(arquivo.getNomeArmazenado());
            Resource resource = new UrlResource(caminho.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = arquivo.getTipoMime() != null && !arquivo.getTipoMime().isBlank()
                    ? arquivo.getTipoMime()
                    : MediaType.APPLICATION_OCTET_STREAM_VALUE;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDispositionInline(arquivo.getNomeOriginal()))
                    .body(resource);
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensagem", "Falha ao abrir o arquivo."));
        }
    }

    private YearMonth parseMes(String mes) {
        if (mes == null || mes.isBlank()) {
            return YearMonth.now();
        }

        try {
            return YearMonth.parse(mes);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Parametro 'mes' invalido. Use o formato yyyy-MM.");
        }
    }

    private List<MultipartFile> normalizarArquivos(MultipartFile[] arquivos) {
        List<MultipartFile> arquivosValidos = new ArrayList<>();
        if (arquivos == null || arquivos.length == 0) {
            return arquivosValidos;
        }

        for (MultipartFile arquivo : arquivos) {
            if (arquivo == null || arquivo.isEmpty()) {
                continue;
            }

            String contentTypeSeguro = Objects.toString(arquivo.getContentType(), "").trim();
            boolean pdf = "application/pdf".equalsIgnoreCase(contentTypeSeguro);
            boolean imagem = contentTypeSeguro.toLowerCase(Locale.ROOT).startsWith("image/");
            if (!pdf && !imagem) {
                return null;
            }

            arquivosValidos.add(arquivo);
        }

        return arquivosValidos;
    }

    private void limparArquivosSalvos(List<Path> arquivosSalvos) {
        for (Path arquivoSalvo : arquivosSalvos) {
            try {
                Files.deleteIfExists(arquivoSalvo);
            } catch (IOException ignored) {
            }
        }
    }

    private String contentDispositionInline(String nomeArquivo) {
        String nomeSeguro = Objects.toString(nomeArquivo, "arquivo").replace("\"", "");
        String encoded = URLEncoder.encode(nomeSeguro, StandardCharsets.UTF_8).replace("+", "%20");
        return "inline; filename=\"" + nomeSeguro + "\"; filename*=UTF-8''" + encoded;
    }

    private byte[] montarRelatorioPdf(Cliente cliente, List<Reuniao> reunioes, YearMonth mes) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font subtitulo = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font cabecalho = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font texto = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Relatorio de Reunioes", titulo));
            document.add(new Paragraph("Cliente: " + (cliente.getNome() != null ? cliente.getNome() : "-"), subtitulo));
            document.add(new Paragraph("Mes de referencia: " + mes.format(DateTimeFormatter.ofPattern("MM/yyyy")), subtitulo));
            document.add(new Paragraph("Gerado em: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), subtitulo));
            document.add(new Paragraph(" "));

            PdfPTable tabela = new PdfPTable(new float[]{1.4f, 4.3f, 2.3f});
            tabela.setWidthPercentage(100);
            tabela.addCell(new Paragraph("Data", cabecalho));
            tabela.addCell(new Paragraph("Anotacoes", cabecalho));
            tabela.addCell(new Paragraph("Anexos", cabecalho));

            DateTimeFormatter dtFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            if (reunioes.isEmpty()) {
                tabela.addCell(new Paragraph("-", texto));
                tabela.addCell(new Paragraph("Sem reunioes registradas para este periodo.", texto));
                tabela.addCell(new Paragraph("-", texto));
            } else {
                for (Reuniao reuniao : reunioes) {
                    tabela.addCell(new Paragraph(reuniao.getDataReuniao() != null ? reuniao.getDataReuniao().format(dtFmt) : "-", texto));
                    tabela.addCell(new Paragraph(reuniao.getAnotacoes() != null && !reuniao.getAnotacoes().isBlank() ? reuniao.getAnotacoes() : "Sem anotacoes.", texto));

                    String anexos = (reuniao.getArquivos() == null || reuniao.getArquivos().isEmpty())
                            ? "Sem anexos"
                            : reuniao.getArquivos().stream().map(ReuniaoArquivo::getNomeOriginal).reduce((a, b) -> a + ", " + b).orElse("Sem anexos");
                    tabela.addCell(new Paragraph(anexos, texto));
                }
            }

            document.add(tabela);
            document.close();
            return out.toByteArray();
        } catch (IOException | DocumentException e) {
            throw new RuntimeException("Erro ao gerar relatorio PDF", e);
        }
    }
}
