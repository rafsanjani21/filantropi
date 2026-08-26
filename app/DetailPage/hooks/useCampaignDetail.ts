import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/lib/auth.service";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";

export function useCampaignDetail(slug: string | null) {
  const { t } = useTranslation();
  const { user, role, isInitialized } = useAuthStore();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<any>(null);

  const fetchMilestoneStatus = useCallback(async (campaignId: string) => {
    try {
      const res = await apiFetch(`/campaigns/milestone-status/${campaignId}`, { method: "GET" });
      if (res?.data) setMilestone(res.data);
    } catch (err) {
      console.error("Gagal menarik status milestone:", err);
    }
  }, []);

  useEffect(() => {
    if (!slug) {
      setError(t("campaign_id_not_found", "ID Kampanye tidak ditemukan"));
      setLoading(false);
      return;
    }

    const fetchCampaign = async () => {
      try {
        const res = await AuthService.getCampaignDetail(slug);
        const data = res.data || res;
        setCampaign(data);
        
        if (data?.current_amount !== undefined) {
          setTotalCollected(Number(data.current_amount));
        }

        if (data?.id) fetchMilestoneStatus(data.id);
      } catch (err: any) {
        setError(err.message || t("fail_fetch_data", "Gagal memuat data"));
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [slug, fetchMilestoneStatus, t]);

  const receiverWallet = campaign?.wallet_address || campaign?.user?.wallet_address || "";
  
  // FETCH HISTORY MENGGUNAKAN API LATEST DONATUR BARU
  useEffect(() => {
    if (!campaign?.id) return;
    
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/campaigns/transactions/latest/${campaign.id}`, { method: "GET" });
        const apiData = res?.data || [];
        
        if (Array.isArray(apiData)) {
          const mappedHistory = apiData.map((tx: any, index: number) => ({
            tx_hash: index.toString(),
            date: tx.mutation_date, 
            type: "In",
            amount: String(tx.total_transfer ?? 0), 
            from_to: tx.sender_name || "Anonim", 
          }));
          
          setWalletHistory(mappedHistory);
        }
      } catch (err) {
        console.error("Gagal memuat riwayat donasi terbaru:", err);
      }
    };
    
    fetchHistory();
  }, [campaign?.id]); 

  return {
    campaign,
    loading,
    error,
    walletHistory,
    totalCollected,
    milestone,
    receiverWallet,
    user,
    role,
    isInitialized,
    fetchMilestoneStatus
  };
}