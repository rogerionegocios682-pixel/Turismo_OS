import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTurismo } from '../../context/TurismoContext';
import { 
  Building2, 
  Save, 
  Upload, 
  Trash2, 
  Download, 
  RefreshCw, 
  Check, 
  Store, 
  Plus, 
  QrCode,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { EmpresaConfig } from '../../types';

export const EmpresaConfigView: React.FC = () => {
  const { 
    empresaConfig, 
    updateEmpresaConfig, 
    exportarBackupCompleto, 
    importarBackupCompleto, 
    restaurarDadosPadrao 
  } = useTurismo();

  const [formConfig, setFormConfig] = useState<EmpresaConfig>(empresaConfig);
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [novaAgenciaNome, setNovaAgenciaNome] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setFormConfig(prev => ({ ...prev, logoBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverLogo = () => {
    setFormConfig(prev => ({ ...prev, logoBase64: '' }));
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmpresaConfig(formConfig);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
    toast.success('Configurações da empresa salvas com sucesso!', {
      icon: '🏢'
    });
  };

  const handleAdicionarAgencia = () => {
    if (!novaAgenciaNome.trim()) return;
    if (formConfig.agencias.includes(novaAgenciaNome.trim())) {
      toast.error('Esta agência já está cadastrada.');
      return;
    }

    setFormConfig(prev => ({
      ...prev,
      agencias: [...prev.agencias, novaAgenciaNome.trim()]
    }));
    toast.success(`Ponto de venda "${novaAgenciaNome.trim()}" adicionado!`, { icon: '📍' });
    setNovaAgenciaNome('');
  };

  const handleRemoverAgencia = (nome: string) => {
    if (formConfig.agencias.length <= 1) {
      toast.error('Você precisa manter ao menos uma agência ativa.');
      return;
    }
    setFormConfig(prev => ({
      ...prev,
      agencias: prev.agencias.filter(a => a !== nome)
    }));
    toast.success(`Agência "${nome}" removida.`, { icon: '🗑️' });
  };

  const handleImportarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const sucesso = importarBackupCompleto(content);
        if (sucesso) {
          toast.success('Backup restaurado com sucesso!', { icon: '💾' });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error('Arquivo de backup inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Configurações da Empresa & Agências (White-Label)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalização completa de vouchers, dados fiscais, chaves PIX de recebimento e filiais.
          </p>
        </div>

        {salvoFeedback && (
          <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Alterações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        
        {/* Bloco 1: Dados Cadastrais e Fiscais */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            1. Identidade & Dados Cadastrais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Fantasia da Marca *</label>
              <input
                type="text"
                required
                value={formConfig.nomeFantasia}
                onChange={(e) => setFormConfig({ ...formConfig, nomeFantasia: e.target.value })}
                placeholder="Ex: Porto Exclusive Receptivo"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={formConfig.razaoSocial}
                onChange={(e) => setFormConfig({ ...formConfig, razaoSocial: e.target.value })}
                placeholder="Ex: Porto Receptivo Eireli"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">CNPJ *</label>
              <input
                type="text"
                required
                value={formConfig.cnpj}
                onChange={(e) => setFormConfig({ ...formConfig, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Registro CADASTUR *</label>
              <input
                type="text"
                required
                value={formConfig.cadastur}
                onChange={(e) => setFormConfig({ ...formConfig, cadastur: e.target.value })}
                placeholder="16.034567.10.0001-4"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">WhatsApp / Central *</label>
              <input
                type="text"
                required
                value={formConfig.telefoneWhatsapp}
                onChange={(e) => setFormConfig({ ...formConfig, telefoneWhatsapp: e.target.value })}
                placeholder="(81) 99999-9999"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cidade Base & Região</label>
              <input
                type="text"
                value={formConfig.cidadeBase}
                onChange={(e) => setFormConfig({ ...formConfig, cidadeBase: e.target.value })}
                placeholder="Ex: Porto de Galinhas - Ipojuca / PE"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Endereço da Loja Principal</label>
              <input
                type="text"
                value={formConfig.enderecoCompleto}
                onChange={(e) => setFormConfig({ ...formConfig, enderecoCompleto: e.target.value })}
                placeholder="Rua Beijupirá, 120 - Centro"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Logotipo Oficial da Empresa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            2. Logotipo para Vouchers & Painéis
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {formConfig.logoBase64 ? (
                <img src={formConfig.logoBase64} alt="Logo Preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[11px] text-slate-400 font-bold text-center px-2">Sem Logo</span>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <p className="text-xs font-bold text-slate-900">Selecione uma imagem (PNG ou JPG)</p>
              <p className="text-[11px] text-slate-500">
                Aparecerá no topo de todas as 2 vias do Voucher A4 e relatórios impressos.
              </p>

              <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                {formConfig.logoBase64 && (
                  <button
                    type="button"
                    onClick={handleRemoverLogo}
                    className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Dados de Pagamento PIX e Sinal Padrão */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            3. Chave PIX da Empresa & Percentual Padrão de Sinal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo da Chave PIX</label>
              <select
                value={formConfig.chavePixTipo}
                onChange={(e) => setFormConfig({ ...formConfig, chavePixTipo: e.target.value as EmpresaConfig['chavePixTipo'] })}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
              >
                <option value="cnpj">CNPJ</option>
                <option value="telefone">Telefone Celular</option>
                <option value="email">E-mail</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chave PIX *</label>
              <input
                type="text"
                required
                value={formConfig.chavePix}
                onChange={(e) => setFormConfig({ ...formConfig, chavePix: e.target.value })}
                placeholder="Chave PIX da conta bancária"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Titular da Conta</label>
              <input
                type="text"
                value={formConfig.nomeTitularPix}
                onChange={(e) => setFormConfig({ ...formConfig, nomeTitularPix: e.target.value })}
                placeholder="Ex: Porto Exclusive Turismo"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              % Padrão de Sinal Sugerido no Balcão
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="number"
                min="10"
                max="100"
                value={formConfig.percentualSinalPadrao}
                onChange={(e) => setFormConfig({ ...formConfig, percentualSinalPadrao: parseInt(e.target.value) || 30 })}
                className="border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-center w-24"
              />
              <span className="text-xs text-slate-500 font-semibold">% do valor total do passeio</span>
            </div>
          </div>
        </div>

        {/* Bloco 4: Pontos de Venda / Agências Filiais */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>4. Pontos de Venda / Agências Filiais</span>
            <span className="text-[10px] text-slate-500 font-normal lowercase">({formConfig.agencias.length} cadastradas)</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={novaAgenciaNome}
              onChange={(e) => setNovaAgenciaNome(e.target.value)}
              placeholder="Ex: Balcão - Galeria Merepe"
              className="flex-1 border border-slate-300 rounded-xl p-2.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAdicionarAgencia}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Ponto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {formConfig.agencias.map((ag, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  {ag}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoverAgencia(ag)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                  title="Remover ponto de venda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 5: Política de Cancelamento & Termos do Voucher */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            5. Cláusulas do Voucher & Regras de Maré
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Política de Cancelamento</label>
            <textarea
              rows={2}
              value={formConfig.politicaCancelamento}
              onChange={(e) => setFormConfig({ ...formConfig, politicaCancelamento: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Termos e Condições do Passeio</label>
            <textarea
              rows={3}
              value={formConfig.termosVoucher}
              onChange={(e) => setFormConfig({ ...formConfig, termosVoucher: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botão de Salvar Alterações */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>Salvar Todas as Configurações da Empresa</span>
        </button>

      </form>

      {/* Bloco de Backup & Restauração de Dados */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Segurança de Dados: Backup & Restauração JSON</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Exporte ou restaure todo o banco de dados (reservas, caixa, motoristas, marés e tarifário) em um único arquivo seguro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportarBackupCompleto}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar Backup Completo (.JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restaurar de Arquivo JSON</span>
            <input type="file" accept=".json" onChange={handleImportarArquivo} className="hidden" />
          </label>

          <button
            onClick={restaurarDadosPadrao}
            className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-red-800 transition-all ml-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restaurar Dados de Fábrica</span>
          </button>
        </div>
      </div>

    </div>
  );
};
