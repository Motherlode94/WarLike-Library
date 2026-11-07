// F : tir automatique. R : recharge. Associer un profil Animator Tir.
// Le signal weapon:shot est à relier aux dégâts / projectiles dans Blueprint.
public int chargeur = 30;
public int reserve = 90;
public float cadence = 0.12;
public float prochainTir = 0;
public float finRecharge = 0;
public bool recharge = false;

Update(){
    if(recharge && Time.time >= finRecharge){
        if(reserve >= 30 - chargeur){ reserve = reserve - (30 - chargeur); chargeur = 30; }
        else { chargeur = chargeur + reserve; reserve = 0; }
        recharge = false;
        Signal("weapon:reloaded");
    }
    if(Input.GetKeyDown("r") && !recharge && reserve > 0 && chargeur < 30){
        recharge = true;
        finRecharge = Time.time + 2;
        Animator.SetTrigger("reloadRequest");
    }
    if(Input.GetKey("f") && !recharge && Time.time >= prochainTir && chargeur > 0){
        chargeur = chargeur - 1;
        prochainTir = Time.time + cadence;
        Animator.SetTrigger("shootRequest");
        Signal("weapon:shot");
    }
}
