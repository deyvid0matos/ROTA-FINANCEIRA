<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório de Viagem #{{ $trip->id }}</title>

<style>
* { font-family: DejaVu Sans, sans-serif; }
body { font-size: 12px; color:#111; }
.title{ font-size:18px; font-weight:700; margin-bottom:6px; }
.muted{ color:#666; }
.small{ font-size:11px; }
.card{ border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin:12px 0; page-break-inside: avoid; }
.hr{ height:1px; background:#e5e7eb; margin:10px 0; }
.grid{ width:100%; border-collapse:collapse; }
.grid td{ padding:6px 0; vertical-align:top; }
.table{ width:100%; border-collapse:collapse; }
.table th, .table td{ border:1px solid #e5e7eb; padding:6px; vertical-align:top; }
.table th{ background:#f9fafb; text-align:left; }
.right{ text-align:right; }
.badge{ padding:2px 6px; border-radius:4px; font-size:10px; }
.badge.active{ background:#dcfce7; color:#166534; }
.badge.inactive{ background:#fee2e2; color:#991b1b; }
.imgbox{ border:1px solid #e5e7eb; border-radius:8px; padding:8px; page-break-inside: avoid; }
.imgtitle{ font-weight: normal; font-size: 12px; color: #111; margin-bottom: 6px; }
.img{ max-width:100%; max-height:180px; height:auto; display:block; margin:0 auto; }
.link{ text-decoration:underline; color:#111; }
.money-nowrap{ white-space: nowrap; }
</style>
</head>
<body>

@if(!empty($companyLogoPath))
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
    <div>
      <div style="width:140px; text-align:right;">
        <img src="{{ $companyLogoPath }}" alt="Logo" style="max-width:140px; max-height:60px; object-fit:contain;">
      </div>
      <br>
      <div class="title" style="margin:0;">Relatório de Viagem #{{ $trip->id }}</div>
      <div class="muted small">Gerado em: {{ now()->format('d/m/Y H:i') }}</div>
    </div>
  </div>
@else
  <div class="title">Relatório de Viagem #{{ $trip->id }}</div>
  <div class="muted small">Gerado em: {{ now()->format('d/m/Y H:i') }}</div>
@endif

<div class="card">
  <table class="grid">
    <tr>
      <td>
        <strong>Empresa:</strong> {{ $companyName ?? '-' }}<br>
        <strong>Descrição:</strong> {{ $trip->trip_name ?: '-' }}<br>
        <strong>Status:</strong> {{ strtoupper($trip->status) }}<br>
        <strong>Rota:</strong> {{ $trip->city_origin }} → {{ $trip->city_destination }}<br>
        <strong>Datas:</strong>
        {{ optional($trip->start_date)->format('d/m/Y') ?? '-' }}
        →
        {{ optional($trip->end_date)->format('d/m/Y') ?? '-' }}<br>
        <strong>Trajeto:</strong> {{ $trip->route_description ?: '-' }}
      </td>

      <td>
        <strong>Funcionário:</strong> {{ $employeeName ?? '-' }}<br>
        <strong>Veículo:</strong> {{ $vehicleLabel ?? '-' }}<br>
        <strong>KM inicial:</strong> {{ $trip->km_start ?? '-' }}<br>
        <strong>KM final:</strong> {{ $trip->km_end ?? '-' }}<br>
        <strong>Total KM:</strong> {{ $trip->total_km ?? '-' }}
      </td>
    </tr>
  </table>
</div>

<div class="card">
  <div style="display:flex; justify-content:space-between;">
    <div><strong>Entradas (ativas):</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($activeEntries,2,',','.') }}</span></div>
    <div><strong>Despesas (ativas):</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($activeExpenses,2,',','.') }}</span></div>
    <div><strong>Saldo:</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($balanceActive,2,',','.') }}</span></div>
  </div>

  <div class="hr"></div>

  <div class="small muted">
    Total geral de entradas: <span class="money-nowrap">R$&nbsp;{{ number_format($allEntries,2,',','.') }}</span> •
    Total geral de despesas: <span class="money-nowrap">R$&nbsp;{{ number_format($allExpenses,2,',','.') }}</span> •
    Faturamento ativo: <span class="money-nowrap">R$&nbsp;{{ number_format($activeBillings ?? 0,2,',','.') }}</span> •
    Faturamento total: <span class="money-nowrap">R$&nbsp;{{ number_format($allBillings ?? 0,2,',','.') }}</span>
  </div>
</div>

<div class="card">
  <div style="display:flex; justify-content:space-between;">
    <div><strong>Itens para faturamento posterior</strong></div>
    <div class="small muted">
      Ativos: <span class="money-nowrap">R$&nbsp;{{ number_format($activeBillings ?? 0,2,',','.') }}</span> •
      Total: <span class="money-nowrap">R$&nbsp;{{ number_format($allBillings ?? 0,2,',','.') }}</span>
    </div>
  </div>

  <div class="hr"></div>

  <table class="table">
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Observação</th>
        <th class="right">Valor</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @forelse(($billings ?? []) as $b)
        <tr>
          <td>{{ $b['billing_date'] ?: '-' }}</td>
          <td>{{ $b['description'] ?: '-' }}</td>
          <td>{{ $b['notes'] ?: '-' }}</td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)$b['amount'],2,',','.') }}</span>
          </td>
          <td>
            @if($b['is_active'])
              <span class="badge active">ativo</span>
            @else
              <span class="badge inactive">inativo</span>
            @endif
          </td>
        </tr>
      @empty
        <tr><td colspan="5" class="muted">Nenhum item de faturamento.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="small muted" style="margin-top:8px;">Esses itens são apenas informativos e não alteram entradas, despesas ou saldo.</div>
</div>

<div class="card">
  <div style="display:flex; justify-content:space-between;">
    <div><strong>Entradas</strong></div>
    <div class="small muted">
      Ativas: <span class="money-nowrap">R$&nbsp;{{ number_format($activeEntries,2,',','.') }}</span> •
      Total: <span class="money-nowrap">R$&nbsp;{{ number_format($allEntries,2,',','.') }}</span>
    </div>
  </div>

  <div class="hr"></div>

  <table class="table">
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Descrição</th>
        <th class="right">Valor</th>
        <th>Status</th>
        <th>Comprovante</th>
      </tr>
    </thead>
    <tbody>
      @forelse($entries as $e)
        <tr>
          <td>{{ $e['type'] }}</td>
          <td>{{ $e['description'] ?: '-' }}</td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)$e['amount'],2,',','.') }}</span>
          </td>
          <td>
            @if($e['is_active'])
              <span class="badge active">ativa</span>
            @else
              <span class="badge inactive">inativa</span>
            @endif
          </td>
          <td>
            @if($e['receipt_kind'] === 'image')
              imagem
            @elseif($e['receipt_kind'] === 'pdf')
              <a class="link" href="{{ $e['receipt_public_url'] }}">abrir PDF</a>
            @else
              -
            @endif
          </td>
        </tr>
      @empty
        <tr><td colspan="5" class="muted">Nenhuma entrada.</td></tr>
      @endforelse
    </tbody>
  </table>
</div>

<div class="card">
  <div style="display:flex; justify-content:space-between;">
    <div><strong>Despesas</strong></div>
    <div class="small muted">
      Ativas: <span class="money-nowrap">R$&nbsp;{{ number_format($activeExpenses,2,',','.') }}</span> •
      Total: <span class="money-nowrap">R$&nbsp;{{ number_format($allExpenses,2,',','.') }}</span>
    </div>
  </div>

  <div class="hr"></div>

  <table class="table">
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Empresa</th>
        <th>Data</th>
        <th>Cidade</th>
        <th>Descrição</th>
        <th>GPS</th>
        <th class="right">Valor</th>
        <th>Status</th>
        <th>Comprovante</th>
      </tr>
    </thead>

    <tbody>
      @forelse($expenses as $e)
        <tr>
          <td>{{ $e['type'] }}</td>
          <td>{{ $e['company_name'] ?: '-' }}</td>
          <td>{{ $e['expense_date'] ?: '-' }}</td>
          <td>{{ $e['city_name'] ?: '-' }}</td>
          <td>{{ $e['description'] ?: '-' }}</td>
          <td>
            @if(!empty($e['latitude']) && !empty($e['longitude']))
                {{ $e['latitude'] }}<br>
                {{ $e['longitude'] }}
            @else
                -
            @endif
          </td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)$e['amount'],2,',','.') }}</span>
          </td>
          <td>
            @if($e['is_active'])
              <span class="badge active">ativa</span>
            @else
              <span class="badge inactive">inativa</span>
            @endif
          </td>
          <td>
            @if($e['receipt_kind'] === 'image')
              imagem
            @elseif($e['receipt_kind'] === 'pdf')
              <a class="link" href="{{ $e['receipt_public_url'] }}">abrir PDF</a>
            @else
              -
            @endif
          </td>
        </tr>
      @empty
        <tr><td colspan="9" class="muted">Nenhuma despesa.</td></tr>
      @endforelse
    </tbody>
  </table>
</div>

@if(!empty($kmStartImagePath) || !empty($kmEndImagePath))
  <div class="card">
    <strong>Fotos do KM</strong>
    <div class="hr"></div>
    <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
      <tr>
        <td style="width:50%; padding:6px; vertical-align:top;">
          @if(!empty($kmStartImagePath))
            <div class="imgbox">
              <div class="imgtitle">KM inicial</div>
              <img class="img" src="{{ $kmStartImagePath }}">
            </div>
          @else
            <div class="imgbox">Sem imagem do KM inicial.</div>
          @endif
        </td>
        <td style="width:50%; padding:6px; vertical-align:top;">
          @if(!empty($kmEndImagePath))
            <div class="imgbox">
              <div class="imgtitle">KM final</div>
              <img class="img" src="{{ $kmEndImagePath }}">
            </div>
          @else
            <div class="imgbox">Sem imagem do KM final.</div>
          @endif
        </td>
      </tr>
    </table>
  </div>
@endif

@if(!empty($receiptImages))
  <div class="card">
    <strong>Comprovantes em imagem</strong>
    <div class="hr"></div>
    <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
      @foreach(array_chunk($receiptImages, 2) as $row)
        <tr>
          @foreach($row as $img)
            <td style="width:50%; padding:6px; vertical-align:top;">
              <div class="imgbox">
                <div class="imgtitle">{{ $img['title'] }}</div>
                <img class="img" src="{{ $img['abs_path'] }}">
              </div>
            </td>
          @endforeach
          @if(count($row) === 1)
            <td style="width:50%; padding:6px;"></td>
          @endif
        </tr>
      @endforeach
    </table>
  </div>
@endif

@if(!empty($receiptPdfs))
  <div class="card">
    <strong>Comprovantes em PDF</strong>
    <div class="hr"></div>
    <ul>
      @foreach($receiptPdfs as $pdfItem)
        <li style="margin-bottom:6px;">
          {{ $pdfItem['title'] }} —
          <a class="link" href="{{ $pdfItem['public_url'] }}">abrir PDF</a>
        </li>
      @endforeach
    </ul>
  </div>
@endif

</body>
</html>