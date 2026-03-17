package com.evoluta.manager.controller;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Reuniao;
import com.evoluta.manager.model.ReuniaoArquivo;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.ReuniaoArquivoRepository;
import com.evoluta.manager.repository.ReuniaoRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public List<Reuniao> listar(@RequestParam(required = false) String mes) {
        YearMonth ref = (mes == null || mes.isBlank()) ? YearMonth.now() : YearMonth.parse(mes);
        return reuniaoRepository.findByDataReuniaoBetweenOrderByDataReuniaoAscCriadoEmDesc(ref.atDay(1), ref.atEndOfMonth());
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

        Reuniao reuniao = new Reuniao();
        reuniao.setCliente(cliente);
        reuniao.setDataReuniao(dataReuniao);
        reuniao.setAnotacoes(anotacoes);
        reuniao.setCriadoEm(LocalDateTime.now());

        if (arquivos != null && arquivos.length > 0) {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            try {
                Files.createDirectories(dir);

                for (MultipartFile arquivo : arquivos) {
                    if (arquivo == null || arquivo.isEmpty()) {
                        continue;
                    }

                    String contentTypeSeguro = Objects.toString(arquivo.getContentType(), "");
                    boolean pdf = "application/pdf".equalsIgnoreCase(contentTypeSeguro);
                    boolean imagem = contentTypeSeguro.toLowerCase(Locale.ROOT).startsWith("image/");
                    if (!pdf && !imagem) {
                        return ResponseEntity.badRequest().body(Map.of("mensagem", "Apenas PDF e imagens sao permitidos."));
                    }

                    String original = Objects.toString(arquivo.getOriginalFilename(), "arquivo");
                    if (original.isBlank()) original = "arquivo";
                    String nome = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
                    Path destino = dir.resolve(nome);
                    Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                    ReuniaoArquivo meta = new ReuniaoArquivo();
                    meta.setReuniao(reuniao);
                    meta.setNomeOriginal(original);
                    meta.setNomeArmazenado(nome);
                    meta.setTipoMime(contentTypeSeguro);
                    meta.setTamanho(arquivo.getSize());
                    reuniao.getArquivos().add(meta);
                }
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("mensagem", "Falha ao salvar os arquivos."));
            }
        }

        return ResponseEntity.ok(reuniaoRepository.save(reuniao));
    }

    @GetMapping("/relatorio-pdf")
    public ResponseEntity<?> gerarRelatorioPdf(@RequestParam Integer clienteId, @RequestParam(required = false) String mes) {
        Cliente cliente = clienteRepository.findById(clienteId).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Cliente nao encontrado."));
        }

        YearMonth ref = (mes == null || mes.isBlank()) ? YearMonth.now() : YearMonth.parse(mes);
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
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + arquivo.getNomeOriginal() + "\"")
                    .body(resource);
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensagem", "Falha ao abrir o arquivo."));
        }
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
