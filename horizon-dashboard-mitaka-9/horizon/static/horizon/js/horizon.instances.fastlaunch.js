$(document).ready(function(){ 
	$("#instances__action_fastlh").text("快速创建主机");
	$("#instances__action_fastlh").click(function(){
		instance_create_form('/dashboard/project/instances/image_list','/dashboard/project/instances/network_list');
	});
	$("#next_secondstep").click(function(){
		instance_flavor_create_action('/dashboard/project/instances/flavor_create');
	});
	$("#instance_create_step").click(function(){
		instance_create_action('/dashboard/project/instances/create');
	});
	$("#password_change_show").click(function(){
		if($("#password_change_show").prop("checked")){
			$("#instance_root_pass").attr("type","text");
		}else{
			$("#instance_root_pass").attr("type","password");
		}
	});
	$("#next_firststep").click(function(){
		if(!$("#image_id_select").val()){
			alert('请选择镜像！')
			return
		}
		$('.frame-second').show().siblings('form').hide();
		$('.button-second').show().siblings().hide();
		$('.content-progress').find('ul li').eq(1).addClass('active');
		$('.content-progress div').removeClass("step1").addClass("step2");
	});
	$("#back_secondstep").click(function(){
		$('.frame-first').show().siblings('form').hide();
		$('.button-first').show().siblings().hide();
		$('.content-progress div').removeClass("step2").addClass("step1");
		$('.content-progress').find('ul li').eq(1).removeClass('active');
	});
	$("#next_secondstep").click(function(){
		$('.frame-third').show().siblings('form').hide();
		$('.button-third').show().siblings().hide();
		$('.content-progress div').removeClass("step2").addClass("step3");
		$('.content-progress').find('ul li').eq(2).addClass('active');
	});
	$("#back_thirdstep").click(function(){
		$('.frame-second').show().siblings('form').hide();
		$('.button-second').show().siblings().hide();
		$('.content-progress div').removeClass("step3").addClass("step2");
		$('.content-progress').find('ul li').eq(2).removeClass('active');
	});
	$("#next_thirdstep").click(function(){
		$('.frame-last').show().siblings('form').hide();
		$('.button-last').show().siblings().hide();
		$('.content-progress div').removeClass("step3").addClass("step4");
		$('.content-progress').find('ul li').eq(3).addClass('active');
	});
	$("#back_laststep").click(function(){
		$('.frame-third').show().siblings('form').hide();
		$('.button-third').show().siblings().hide();
		$('.content-progress div').removeClass("step4").addClass("step3");
		$('.content-progress').find('ul li').eq(3).removeClass('active');
	});
});
function fastLaunchInstance() {
	alert("是否存在框体："+$("#myModalLabel").html());
}

function init_instance_create_form(){
	$('.frame-first').show().siblings('form').hide();
	$('.button-first').show().siblings().hide();
	$('.content-progress div').removeClass("step2 step3 step4").addClass("step1");
	$('.content-progress').find('ul li').eq(1).removeClass('active');
	$(".list-group").empty()
	$("#image_name_select").empty()
	$("#image_id_select").val('')
	
	
	$(".cpu-type").find("li").click(function(){
		$(".cpu-type").find("li").removeClass('active')
		$("#vcpus_select").empty()
		$("#vcpus_select").append($(this).find('span').html())
		$(this).addClass("active")
	})
	$(".cpu-type").find("li").eq(0).click()
	$(".mic-type").find("li").click(function(){
		$(".mic-type").find("li").removeClass('active')
		$("#memory_select").empty()
		$("#memory_select").append($(this).find('span').html())
		$(this).addClass("active")
	})
	$(".mic-type").find("li").eq(0).click()
	$(".disk-type").find("li").click(function(){
		$(".disk-type").find("li").removeClass('active')
		$("#disk_select").empty()
		$("#disk_select").append($(this).find('span').html())
		$(this).addClass("active")
	})
	$(".disk-type").find("li").eq(1).click()
	$('#network_list_select').empty()
	var instance_detail_form= $("#instance_create_detail")
	if(instance_detail_form.data('bootstrapValidator')){
		$(instance_detail_form).data('bootstrapValidator').resetForm()
	}
	instance_detail_form[0].reset();
	
}

function instance_create_form(image_list_url,subnetwork_list_url){
	$('#firststep').addClass("in");
	$('#firststep').modal();
	init_instance_create_form()
	var image_data=null;
	$.ajax({
		url:image_list_url,
		type:"get",
		data:{},
		async:false,
        success:function (data){
            if (data=='error'){
            	alert("取得镜像失败!");
            	return
            }
            image_data= eval("(" + data + ")");

        },
        error: function (data, status, e) {
            alert("取得镜像失败!");
        }
    });
	$("#operate-os").find("li").click(function () {
		$(this).addClass("active").siblings().removeClass("active");
		var os_type=$(this).find("div span").attr('title')
		$(".list-group").empty()
		if(image_data!=null){
			for(var key in image_data[os_type]){
				$(".list-group").append('<a href="#" class="list-group-item"><input type="hidden" value="'+image_data[os_type][key]['id']+'"><span>'+image_data[os_type][key]['name']+'</span><span class="fr">'+image_data[os_type][key]['size']+'M</span></a>')
			}
		}
		$(".list-group").find("a").click(function(){
			$("#image_name_select").empty()
			$("#image_name_select").append($(this).find('span').eq(0).html())
			$("#image_id_select").val($(this).find('input').val())
		})
	});
	$("#operate-os").find("li").eq(0).click()
	
	$.ajax({
		url:subnetwork_list_url,
		type:"get",
		data:{},
		async:false,
        success:function (data){
        	if (data=='error'){
            	alert("取得区域信息失败!");
            	return
            }
            var nets= eval("(" + data + ")");
            if(nets.length<1)
            	return
            $('#network_list_select').empty()
            for(var key in nets){
            	var option = $("<option>").val(nets[key]['id']).text(nets[key]['name']);
            	$('#network_list_select').append(option)
            }
        },
        error: function (data, status, e) {
            alert("赠送失败!");
        }
    });
}


function instance_flavor_create_action(instance_flavor_create_url) {
	var vcpus=$("#vcpus_select").html()
	var memory=$("#memory_select").html()
	var disk=$("#disk_select").html()
	var ephemeral = $("#ephemeral_disk_select").html()
	var swap = $("#swap_disk_select").html()
    return flavor_create_ajax(vcpus,memory,disk,ephemeral,swap,instance_flavor_create_url);

}
function flavor_create_ajax(vcpus,memory,disk,ephemeral,swap,url){
	$.ajax({
		url:url,
		type:"get",
		data:{'vcpus':vcpus,'memory':memory,'disk':disk,'ephemeral':ephemeral,'swap':swap},
		async:true,
        success:function (data){
        	$("#instance_create_flavor_id").val(data);
        	return data;
        },
        error: function (data, status, e) {
        }
    });
}

function validate_create_instance_form(){
	var name=$("#instance_name_input").val();
	if(!name){
		alert("请输入主机名!");
		return false
	}
	var root_pass=$("#instance_root_pass").val();
	if(!root_pass){
		alert("请输入密码!");
		return false;
	}
	var instance_count=$("#instance_count_input").val();
	if(instance_count && instance_count>0){
		return true;
	}
	return false;
}

function instance_create_action(instance_create_url){
	if(!validate_create_instance_form){
		return;
	}
	var image_id=$("#image_id_select").val()
	var netid=$("#network_list_select").val()
	var name=$("#instance_name_input").val()
	var root_pass=$("#instance_root_pass").val()
	var instance_count=$("#instance_count_input").val()
	var flavor_id = $("#instance_create_flavor_id").val();
	if(!flavor_id){
		var vcpus=$("#vcpus_select").html()
		var memory=$("#memory_select").html()
		var disk=$("#disk_select").html()
		var ephemeral = $("#ephemeral_disk_select").html()
		var swap = $("#swap_disk_select").html()
		flavor_id = instance_flavor_create_action("/dashboard/project/instances/flavor_create");
	}
	$.ajax({
		url:instance_create_url,
		type:"get",
		data:{'image_id':image_id,'flavor_id':flavor_id,'netid':netid,'name':name,'root_pass':root_pass,'instance_count':instance_count},
		async:true,
        success:function (data){
            if (data=='success'){
            	$("#firststep").modal('toggle');
            	$("#instance_create_flavor_id").val();
            	window.location.reload();
            }
            else{
            	horizon.clearErrorMessages();
            	horizon.alert('error', gettext('There was a problem to launch this  server, please try again.'));
            }
        },
        error: function (data, status, e) {
        	horizon.clearErrorMessages();
        	horizon.alert('error', gettext('There was a problem to launch this  server, please try again.'))
        }
    });
}
